# Driving School Management System

<div align="center">

**A modern, full-stack web application for comprehensive driving school administration**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)

[Features](#features) • [Installation](#installation-and-setup) • [Documentation](#system-architecture) • [Contributing](#contributing-guidelines)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [Contributing Guidelines](#contributing-guidelines)
- [Project Management](#project-management)
- [Roadmap](#roadmap)
- [License](#license)
- [Team](#team)

---

## Overview

The **Driving School Management System** is an enterprise-grade web application designed to digitize and streamline driving school operations. Built with modern web technologies, it provides a centralized platform for managing all aspects of a driving school, from student enrollment to payment processing.

### Purpose

This system addresses the administrative challenges faced by driving schools by providing:

- Centralized data management for students, instructors, and vehicles
- Automated scheduling with conflict detection
- Real-time availability tracking
- Comprehensive financial record-keeping
- Analytics and reporting capabilities

### Target Users

- **Administrators**: Full system access for managing all resources
- **Instructors**: Access to schedules, student information, and lesson records
- **Students**: View personal schedules, progress, and payment history

---

## Key Features

### Student Management
- Complete student registration and onboarding workflow
- Detailed profile management with document uploads
- Progress tracking and performance analytics
- Enrollment history and status monitoring

### Instructor Management
- Instructor profile creation with certification tracking
- Availability calendar management
- Performance metrics and student feedback
- Workload distribution analytics

### Vehicle Management
- Comprehensive vehicle inventory system
- Maintenance schedule tracking and alerts
- Usage logs and mileage tracking
- Availability status management

### Scheduling System
- Intelligent lesson scheduling with conflict detection
- Real-time availability checking
- Calendar integration for instructors and students
- Automated schedule notifications

### Payment Processing
- Secure payment recording and tracking
- Automated receipt generation
- Outstanding balance monitoring
- Payment history and financial reports

### Administrative Dashboard
- Real-time system statistics and KPIs
- Revenue and expense tracking
- Student enrollment trends
- Instructor performance metrics
- Vehicle utilization reports

---

## Technology Stack

<table>
<tr>
<td>

**Frontend**
- Next.js 14
- React 18
- Tailwind CSS
- Axios
- React Query

</td>
<td>

**Backend**
- Node.js 16+
- Express.js
- Mongoose ODM
- JWT Authentication
- Express Validator

</td>
<td>

**Database**
- MongoDB 5.0+
- MongoDB Atlas (Production)

</td>
</tr>
</table>

### Development Tools

| Category | Tools |
|----------|-------|
| **Version Control** | Git, GitHub |
| **Code Quality** | ESLint, Prettier |
| **API Testing** | Postman, Thunder Client |
| **Package Manager** | npm, yarn |

---

## System Architecture

### Architecture Overview

The application implements a three-tier architecture pattern:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    PRESENTATION LAYER                      ┃
┃  ┌──────────────────────────────────────────────────┐    ┃
┃  │   Next.js Frontend (React Components)            │    ┃
┃  │   - Admin Dashboard                              │    ┃
┃  │   - Student Portal                               │    ┃
┃  │   - Instructor Portal                            │    ┃
┃  └────────────────────┬─────────────────────────────┘    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                        │ RESTful API (HTTPS)
                        │
┏━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    APPLICATION LAYER                       ┃
┃  ┌────────────────────▼─────────────────────────────┐    ┃
┃  │   Express.js Server                              │    ┃
┃  │   ┌──────────┐  ┌──────────┐  ┌──────────┐      │    ┃
┃  │   │  Routes  │  │Controllers│  │Middleware│      │    ┃
┃  │   └──────────┘  └──────────┘  └──────────┘      │    ┃
┃  │   - Business Logic                               │    ┃
┃  │   - Authentication & Authorization               │    ┃
┃  │   - Request Validation                           │    ┃
┃  └────────────────────┬─────────────────────────────┘    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                        │ Mongoose ODM
                        │
┏━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     DATA LAYER                             ┃
┃  ┌────────────────────▼─────────────────────────────┐    ┃
┃  │   MongoDB Database                               │    ┃
┃  │   ┌──────────┐  ┌──────────┐  ┌──────────┐      │    ┃
┃  │   │ Students │  │Instructors│  │ Vehicles │      │    ┃
┃  │   └──────────┘  └──────────┘  └──────────┘      │    ┃
┃  │   ┌──────────┐  ┌──────────┐                    │    ┃
┃  │   │Schedules │  │ Payments │                    │    ┃
┃  │   └──────────┘  └──────────┘                    │    ┃
┃  └──────────────────────────────────────────────────┘    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Data Flow

1. **Client Request**: User interacts with the Next.js frontend
2. **API Call**: Frontend sends HTTP request to Express backend
3. **Authentication**: JWT token validation in middleware
4. **Business Logic**: Controller processes the request
5. **Database Operation**: Mongoose executes CRUD operations on MongoDB
6. **Response**: Data flows back through the layers to the client

---

## Project Structure

```
driving-school-management/
│
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database connection configuration
│   │   └── config.env            # Environment configuration
│   │
│   ├── controllers/
│   │   ├── studentController.js  # Student business logic
│   │   ├── instructorController.js
│   │   ├── vehicleController.js
│   │   ├── scheduleController.js
│   │   └── paymentController.js
│   │
│   ├── models/
│   │   ├── Student.js            # Student schema
│   │   ├── Instructor.js         # Instructor schema
│   │   ├── Vehicle.js            # Vehicle schema
│   │   ├── Schedule.js           # Schedule schema
│   │   └── Payment.js            # Payment schema
│   │
│   ├── routes/
│   │   ├── studentRoutes.js      # Student API endpoints
│   │   ├── instructorRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── scheduleRoutes.js
│   │   └── paymentRoutes.js
│   │
│   ├── middlewares/
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Global error handling
│   │   └── validation.js         # Request validation
│   │
│   ├── utils/
│   │   ├── helpers.js            # Utility functions
│   │   └── constants.js          # Application constants
│   │
│   ├── server.js                 # Application entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable UI components
│   │   │   ├── students/         # Student-related components
│   │   │   ├── instructors/      # Instructor-related components
│   │   │   ├── vehicles/         # Vehicle-related components
│   │   │   ├── schedules/        # Schedule-related components
│   │   │   └── payments/         # Payment-related components
│   │   │
│   │   ├── pages/
│   │   │   ├── index.js          # Home page
│   │   │   ├── dashboard/        # Admin dashboard
│   │   │   ├── students/         # Student management pages
│   │   │   ├── instructors/      # Instructor management pages
│   │   │   └── api/              # API routes (if using Next.js API)
│   │   │
│   │   ├── lib/
│   │   │   ├── api.js            # API client configuration
│   │   │   └── utils.js          # Utility functions
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css       # Global styles
│   │   │   └── tailwind.css      # Tailwind configuration
│   │   │
│   │   └── hooks/                # Custom React hooks
│   │
│   ├── public/
│   │   ├── images/
│   │   └── assets/
│   │
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.local
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Installation and Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Abderrahamane/driving-school-management.git
cd driving-school-management
```

### Step 2: Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration (see [Environment Configuration](#environment-configuration)).

#### Start the Backend Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The backend API will be running at `http://localhost:5000`

### Step 3: Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your configuration.

#### Start the Frontend Server

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

The frontend application will be running at `http://localhost:3000`

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGO_URI=mongodb://localhost:27017/driving-school
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/driving-school

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-email-password

# File Upload (Optional)
MAX_FILE_UPLOAD=5000000
FILE_UPLOAD_PATH=./uploads

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Application Configuration
NEXT_PUBLIC_APP_NAME=Driving School Management
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

---

## Usage

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api-docs (if configured)

### Default Admin Credentials

After initial setup, use these credentials to access the admin dashboard:

```
Email: admin@drivingschool.com
Password: admin123
```

**Important**: Change these credentials immediately after first login.

---

## Contributing Guidelines

We welcome contributions from all team members. Please follow these guidelines to maintain code quality and project organization.

### Workflow Overview

```
1. Create Branch → 2. Make Changes → 3. Commit → 4. Push → 5. Pull Request → 6. Code Review → 7. Merge
```

### Branch Naming Convention

Use descriptive branch names following this pattern:

| Branch Type | Format | Example |
|-------------|--------|---------|
| New Feature | `feature/<description>` | `feature/add-student-form` |
| Bug Fix | `bugfix/<description>` | `bugfix/fix-payment-calculation` |
| Hotfix | `hotfix/<description>` | `hotfix/critical-security-patch` |
| Documentation | `docs/<description>` | `docs/update-readme` |

### Creating a New Branch

```bash
# Update your local main branch
git checkout main
git pull origin main

# Create and switch to a new branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write Clean Code**: Follow the project's coding standards
2. **Add Comments**: Document complex logic
3. **Test Thoroughly**: Ensure your changes work as expected

### Committing Changes

Use clear, descriptive commit messages:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add student registration form with validation"
```

#### Commit Message Guidelines

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the subject line under 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Separate subject from body with a blank line

**Good Examples:**
```
Add email validation to student registration form
Fix payment calculation bug in checkout process
Update instructor availability calendar component
Refactor vehicle management API endpoints
```

**Bad Examples:**
```
fixed stuff
update
WIP
asdfgh
```

### Pushing Changes

```bash
# Push your branch to the remote repository
git push -u origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to the GitHub repository
2. Click "New Pull Request"
3. Select your branch as the source
4. Select `main` as the target
5. Fill in the PR template:
   - **Title**: Brief description of changes
   - **Description**: Detailed explanation of what was changed and why
   - **Related Issues**: Link to any related GitHub issues
   - **Testing**: Describe how you tested your changes

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #issue_number

## Testing
Describe the testing you performed

## Screenshots (if applicable)
Add screenshots to demonstrate changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have tested my changes thoroughly
```

### Code Review Process

1. **Wait for Review**: Do not merge your own pull requests
2. **Address Feedback**: Make requested changes promptly
3. **Update PR**: Push additional commits to address review comments
4. **Approval**: Project leader will approve and merge when ready

### Important Rules

- **Never push directly to `main` branch**
- **Never merge your own pull requests**
- **Always create a new branch for each task**
- **Keep pull requests focused and small**
- **Write meaningful commit messages**
- **Test your changes before pushing**

---

## Project Management

### Issue Tracking

All tasks, bugs, and feature requests are managed through **GitHub Issues**.

#### Issue Labels

| Label | Purpose |
|-------|---------|
| `bug` | Something isn't working correctly |
| `feature` | New feature or enhancement request |
| `documentation` | Documentation improvements |
| `enhancement` | Improvement to existing functionality |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | High priority issue |
| `priority: medium` | Medium priority issue |
| `priority: low` | Low priority issue |

### Workflow

1. **Check Issues Tab**: Regularly review the Issues section
2. **Claim an Issue**: Comment on the issue to claim it
3. **Wait for Assignment**: Project leader will officially assign it to you
4. **Create Branch**: Start work only after assignment
5. **Work on Issue**: Focus solely on the assigned task
6. **Submit PR**: Link your pull request to the issue
7. **Update Issue**: Add progress updates in comments

### Communication Guidelines

- **Ask Questions**: Use issue comments for clarifications
- **Report Blockers**: Immediately notify if you're stuck
- **Provide Updates**: Comment on progress regularly
- **Be Respectful**: Maintain professional communication
- **Be Responsive**: Reply to comments within 24 hours

---

## Roadmap

### Phase 1: Core Functionality (Current)

- [x] Project setup and architecture
- [x] Database schema design
- [x] Basic CRUD operations for students, instructors, and vehicles
- [ ] User authentication system
- [ ] Administrative dashboard
- [ ] Scheduling system

### Phase 2: Enhanced Features (Q2 2025)

- [ ] **JWT Authentication**: Secure token-based authentication
- [ ] **Role-Based Access Control**: Fine-grained permissions system
- [ ] **Email Notifications**: Automated email reminders for lessons
- [ ] **SMS Integration**: Text message notifications and reminders
- [ ] **Advanced Search**: Filter and search across all entities
- [ ] **Export Functionality**: Export reports to PDF and Excel

### Phase 3: Analytics & Reporting (Q3 2025)

- [ ] **Student Progress Dashboard**: Track learning milestones
- [ ] **Instructor Performance Metrics**: Workload and success rates
- [ ] **Financial Reports**: Revenue, expenses, and profit analysis
- [ ] **Vehicle Utilization Reports**: Usage statistics and efficiency
- [ ] **Custom Report Builder**: Create tailored reports

### Phase 4: Advanced Integration (Q4 2025)

- [ ] **Online Payment Gateway**: Stripe/PayPal integration
- [ ] **Calendar Sync**: Google Calendar and Outlook integration
- [ ] **Document Management**: Upload and store certificates and documents
- [ ] **Exam Management**: Theory and practical exam scheduling
- [ ] **Mobile Responsive Design**: Optimized mobile experience

### Phase 5: Mobile & Localization (Q1 2026)

- [ ] **Mobile Application**: Native iOS and Android apps
- [ ] **Multi-Language Support**: English and French interfaces
- [ ] **Offline Mode**: Work without internet connection
- [ ] **Push Notifications**: Real-time alerts on mobile devices
- [ ] **Biometric Authentication**: Fingerprint and face recognition

### Future Considerations

- AI-powered student progress prediction
- Virtual driving simulation integration
- Multi-branch management for franchise operations
- API for third-party integrations
- White-label solution for licensing

---

## License

This project is licensed under the **MIT License**.

### MIT License

```
Copyright (c) 2025 Driving School Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

---

## Team

### Project Leadership

**BELMILOUD Nada** - *Project Leader & Lead Developer*
- Code review and quality assurance
- Architecture decisions and technical leadership
- Task assignment and sprint planning
- Repository management and deployment oversight
- GitHub: [@username]

### Development Team

**Contributors are welcome!** We're looking for developers interested in:
- Frontend development (React/Next.js)
- Backend development (Node.js/Express)
- Database design (MongoDB)
- UI/UX design
- Documentation
- Testing and QA

### How to Join

Interested in contributing? Here's how to get started:

1. Read the [Contributing Guidelines](#contributing-guidelines)
2. Check the [Issues](https://github.com/Abderrahamane/driving-school-management/issues) page for open tasks
3. Fork the repository and create your branch
4. Submit your first pull request

---

## Support

### Getting Help

If you encounter any issues or have questions:

1. **Check Documentation**: Review this README and project wiki
2. **Search Issues**: Look for similar problems in closed issues
3. **Ask Questions**: Open a new issue with the `question` label
4. **Contact Maintainers**: Reach out to the project leader

### Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots or error messages
- Environment details (OS, browser, Node version)

### Feature Requests

We welcome feature suggestions! Please:

- Check if the feature already exists or is planned
- Explain the use case and benefit
- Provide examples or mockups if possible
- Open an issue with the `feature` label

---

## Acknowledgments

Built with modern web technologies and best practices. Special thanks to:

- The open-source community
- All contributors to this project
- Educational institutions supporting this initiative

---

<div align="center">

**Made with dedication for efficient driving school management**

[Report Bug](https://github.com/Abderrahamane/driving-school-management/issues) • [Request Feature](https://github.com/Abderrahamane/driving-school-management/issues) • [Documentation](https://github.com/Abderrahamane/driving-school-management/wiki)

</div>
