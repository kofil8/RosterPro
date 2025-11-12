# Local PostgreSQL & Redis Setup Guide

## ✅ Services Detected
- PostgreSQL: Running on port 5432
- Redis: Running on port 6379

## 🔧 Configuration Steps

### 1. Update DATABASE_URL in `.env`

Your PostgreSQL connection needs a password. Update the `DATABASE_URL` in `.env`:

**If you have a password:**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/roster_db?schema=public
```

**If no password (trust authentication):**
```
DATABASE_URL=postgresql://postgres@localhost:5432/roster_db?schema=public
```

### 2. Find Your PostgreSQL Password

If you don't remember your PostgreSQL password, you can:

**Option A: Reset password (if you have admin access)**
1. Open pgAdmin or PostgreSQL command line
2. Connect as superuser
3. Run: `ALTER USER postgres PASSWORD 'your_new_password';`

**Option B: Check if password is stored**
- Check pgAdmin saved connections
- Check your PostgreSQL installation notes
- Try common defaults: `postgres`, `admin`, `root`, or empty

### 3. Create Database (if needed)

Once connected, Prisma will create the database automatically when you run:
```bash
npm run prisma:migrate
# or
npx prisma db push
```

### 4. Test Connection

After updating `.env`, test the connection:
```bash
npm run dev
```

The server should start without authentication errors.

## 📝 Current Configuration

- **PostgreSQL Host**: localhost:5432
- **Database**: roster_db (will be created automatically)
- **User**: postgres
- **Redis**: localhost:6379

## 🚀 Next Steps

1. Update `DATABASE_URL` in `.env` with your PostgreSQL password
2. Run `npm run dev` to start the backend
3. If successful, run `npm run prisma:seed` to populate demo data

