import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("--> [SERVER] Iniciando Jogo Fácil...");

// Inicializa Prisma
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Health Check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; 
    res.status(200).send('OK - DB Connected');
  } catch (e) {
    console.error("[HEALTH] DB Error:", e);
    res.status(500).send('Error connecting to DB');
  }
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subTeams: true }
    });

    if (user && user.password === password) {
      const { password, ...userWithoutPass } = user;
      res.json(userWithoutPass);
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (e) {
    console.error("[LOGIN ERROR]", e);
    res.status(500).json({ error: 'Erro no servidor ao fazer login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const data = req.body;
  
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Convert fields to match Prisma schema
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          phoneNumber: data.phoneNumber,
          subscription: data.subscription,
          subscriptionExpiry: data.subscriptionExpiry ? new Date(data.subscriptionExpiry) : null,
          latitude: Number(data.latitude || -23.55),
          longitude: Number(data.longitude || -46.63),
          subTeams: {
            create: data.subTeams?.map(t => ({ name: t.name, category: t.category })) || []
          }
        }
      });

      // Create Field if Owner
      if (data.role === 'FIELD_OWNER' && data.fieldData) {
        await tx.field.create({
          data: {
            name: data.fieldData.name,
            location: data.fieldData.location,
            hourlyRate: Number(data.fieldData.hourlyRate),
            cancellationFeePercent: Number(data.fieldData.cancellationFeePercent),
            pixKey: data.fieldData.pixConfig.key,
            pixName: data.fieldData.pixConfig.name,
            imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1470&auto=format&fit=crop',
            contactPhone: data.fieldData.contactPhone,
            latitude: user.latitude,
            longitude: user.longitude,
            ownerId: user.id
          }
        });
      }
      return user;
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: result.id },
      include: { subTeams: true }
    });
    
    const { password, ...safeUser } = fullUser;
    res.json(safeUser);

  } catch (e) {
    console.error("[REGISTER ERROR]", e);
    res.status(500).json({ error: `Erro ao cadastrar: ${e.message}` });
  }
});

// --- User Routes ---
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, subTeams, subscription } = req.body;
  try {
    await prisma.user.update({
      where: { id },
      data: { name, phoneNumber, subscription }
    });
    // Simples substituição de times
    await prisma.subTeam.deleteMany({ where: { userId: id } });
    if (subTeams?.length > 0) {
      await prisma.subTeam.createMany({
        data: subTeams.map(t => ({ name: t.name, category: t.category, userId: id }))
      });
    }
    const updatedUser = await prisma.user.findUnique({ where: { id }, include: { subTeams: true } });
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// --- Data Routes ---
app.get('/api/fields', async (req, res) => {
  try {
    const fields = await prisma.field.findMany();
    const mapped = fields.map(f => ({
      ...f,
      pixConfig: { key: f.pixKey, name: f.pixName }
    }));
    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar campos' });
  }
});

app.get('/api/slots', async (req, res) => {
  try {
    const slots = await prisma.matchSlot.findMany();
    res.json(slots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar slots' });
  }
});

app.post('/api/slots', async (req, res) => {
  const slotsData = req.body;
  try {
    if (Array.isArray(slotsData)) {
      await prisma.matchSlot.createMany({ data: slotsData });
    } else {
      await prisma.matchSlot.create({ data: slotsData });
    }
    const allSlots = await prisma.matchSlot.findMany();
    res.json(allSlots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao criar slot' });
  }
});

app.put('/api/slots/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await prisma.matchSlot.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao atualizar slot' });
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Rodando na porta ${PORT}`);
});