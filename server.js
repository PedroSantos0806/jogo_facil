import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// --- API ROUTES ---

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subTeams: true }
    });

    if (user && user.password === password) {
      // In production, NEVER return password. 
      const { password, ...userWithoutPass } = user;
      res.json(userWithoutPass);
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (e) {
    console.error("Login Error:", e);
    res.status(500).json({ error: 'Erro no servidor ao fazer login. Tente novamente.' });
  }
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const data = req.body;
  console.log("Registering user:", data.email, data.role);
  
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      console.log("User already exists:", data.email);
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Transaction to create User, SubTeams, and Field if needed
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          phoneNumber: data.phoneNumber,
          subscription: data.subscription,
          subscriptionExpiry: data.subscriptionExpiry ? new Date(data.subscriptionExpiry) : null,
          latitude: data.latitude || -23.55,
          longitude: data.longitude || -46.63,
          subTeams: {
            create: data.subTeams?.map(t => ({ name: t.name, category: t.category })) || []
          }
        }
      });

      if (data.role === 'FIELD_OWNER' && data.fieldData) {
        console.log("Creating field for user:", user.id);
        await tx.field.create({
          data: {
            name: data.fieldData.name,
            location: data.fieldData.location,
            hourlyRate: Number(data.fieldData.hourlyRate),
            cancellationFeePercent: Number(data.fieldData.cancellationFeePercent),
            pixKey: data.fieldData.pixConfig.key,
            pixName: data.fieldData.pixConfig.name,
            imageUrl: 'https://picsum.photos/400/300?grayscale',
            contactPhone: data.fieldData.contactPhone,
            latitude: user.latitude || 0,
            longitude: user.longitude || 0,
            ownerId: user.id
          }
        });
      }

      return user;
    });

    const { password, ...userWithoutPass } = result;
    const fullUser = await prisma.user.findUnique({
      where: { id: result.id },
      include: { subTeams: true }
    });
    
    console.log("Registration successful for:", fullUser.email);
    res.json(fullUser);

  } catch (e) {
    console.error("Registration Error:", e);
    res.status(500).json({ error: `Erro ao criar conta: ${e.message || 'Erro interno'}` });
  }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, subTeams, subscription } = req.body;

  try {
    await prisma.user.update({
      where: { id },
      data: { name, phoneNumber, subscription }
    });

    // Handle SubTeams (Delete all and recreate for simplicity)
    await prisma.subTeam.deleteMany({ where: { userId: id } });
    if (subTeams && subTeams.length > 0) {
      await prisma.subTeam.createMany({
        data: subTeams.map(t => ({ name: t.name, category: t.category, userId: id }))
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: { subTeams: true }
    });
    res.json(updatedUser);
  } catch (e) {
    console.error("Update User Error:", e);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Get Fields
app.get('/api/fields', async (req, res) => {
  try {
    const fields = await prisma.field.findMany();
    const mapped = fields.map(f => ({
      ...f,
      pixConfig: { key: f.pixKey, name: f.pixName }
    }));
    res.json(mapped);
  } catch (e) {
    console.error("Get Fields Error:", e);
    res.status(500).json({ error: 'Erro ao buscar campos' });
  }
});

// Get Slots
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await prisma.matchSlot.findMany();
    res.json(slots);
  } catch (e) {
    console.error("Get Slots Error:", e);
    res.status(500).json({ error: 'Erro ao buscar horários' });
  }
});

// Create Slots
app.post('/api/slots', async (req, res) => {
  const slotsData = req.body;
  try {
    // Need to manually handle `allowedCategories` if it's not supported directly by your DB provider in Prisma lists
    // Postgres supports String[], so it's fine.
    await prisma.matchSlot.createMany({
      data: slotsData
    });
    const allSlots = await prisma.matchSlot.findMany();
    res.json(allSlots);
  } catch (e) {
    console.error("Create Slots Error:", e);
    res.status(500).json({ error: 'Erro ao criar horários' });
  }
});

// Update Slot
app.put('/api/slots/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await prisma.matchSlot.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (e) {
    console.error("Update Slot Error:", e);
    res.status(500).json({ error: 'Erro ao atualizar horário' });
  }
});

// Catch-all handler for React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});