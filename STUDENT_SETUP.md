# 🎓 Student Quick Setup Guide

**For Code Academy Berlin Students**

This guide will help you set up CODAC quickly without any errors!

## ⚡ Super Quick Start

1. **Clone the project**

   ```bash
   git clone https://github.com/codeacademyberlin/codac.git
   cd codac
   ```

2. **Run setup**

   **Windows:** Double-click `setup.bat` OR run in terminal:

   ```bash
   setup.bat
   ```

   **Mac/Linux:** Run in terminal:

   ```bash
   ./setup.sh
   ```

3. **Start the app**

   ```bash
   pnpm dev
   ```

4. **Open in browser**
   Go to: http://localhost:3000

## 🔐 Test Accounts

Use these accounts to log in and explore:

- **Student:** alex.mueller@student.codeacademyberlin.com
- **Alumni:** lisa.weber@alumni.codeacademyberlin.com
- **Instructor:** dr.anna.hoffmann@instructor.codeacademyberlin.com

## 🆘 Common Issues & Fixes

### "Node.js not found"

- Install Node.js 18+ from https://nodejs.org/
- Restart your terminal after installation

### "Permission denied" or "Access denied"

- **Windows:** Run terminal as Administrator
- **Mac/Linux:** Use `sudo` before commands if needed

### "Port 3000 already in use"

- Stop other development servers
- Or change port: `pnpm dev --port 3001`

### "Database error" or "Prisma error"

- Run: `pnpm db:reset`
- If still failing: Delete `prisma/dev.db` file and run setup again

### "pnpm not found"

- Install pnpm: `npm install -g pnpm`
- Or use npm instead: Replace `pnpm` with `npm` in commands

### Setup script fails

- Try manual setup from README.md
- Ask your instructor for help
- Check GitHub Issues tab

## 📚 What's Included

After setup, you'll have:

- ✅ Sample courses and lessons
- ✅ Demo user accounts
- ✅ Community posts and discussions
- ✅ Achievement system
- ✅ Document editor
- ✅ All required directories

## 🎯 Next Steps

1. Explore the dashboard
2. Try creating a document
3. Join community discussions
4. Check out the courses
5. Start building your portfolio!

## 🤝 Need Help?

1. **First:** Check this troubleshooting section
2. **Then:** Ask classmates in your cohort
3. **Finally:** Contact your instructor

---

**Happy coding! 🚀**
