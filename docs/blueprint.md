# **App Name**: BranchWise

## Core Features:

- Super Admin Login: Secure login for the super administrator to manage the entire system.
- Branch Login: Secure login for branch-level users to manage their specific branch data.
- Staff Login: Secure login for staff members with role-based access control.
- Password Encryption: Encryption of passwords using bcrypt for enhanced security.
- JWT Authentication: Authentication using JWT (Access + Refresh Tokens) for secure session management.
- Forgot Password: Password reset functionality via email OTP.
- Change Password: Feature to allow users to change their passwords within their profile.
- Role-Based Access Control: Implementation of role-based page access, restricting access based on user roles (Super Admin, Branch Admin, Staff).
- Dashboard: Main overview screen displaying key metrics, analytics, and daily status for Admin & Branches.
- Branch Management: CRUD operations for managing branch information, including adding, editing, deleting, activating, and deactivating branches.
- Student Management: CRUD operations for student records, including search, filter, export, and pagination. Also includes features for printing admission forms and uploading student photos.
- Course Management: Management of courses offered by the institution, including adding, editing, and deleting courses.
- Educator / Staff Management: Management of teachers and staff members, including adding, editing, deleting, and managing role-based access.
- Fee & Finance Management: Tracking of total fees collected, recording fee payments, showing pending dues, and generating printable receipts.
- Notice Board: Management of notices with CRUD operations, filtering of expired notices, and export functionality.
- Live Classes: Management of online live sessions (Zoom / Google Meet), including adding, editing, deleting, and marking classes as completed.
- Payment Settings: Configuration of payment settings, including UPI ID and QR code image upload.
- Website Management: Dynamic content editing for the public website, including homepage settings, mission & vision, gallery, and SEO meta information.
- System Settings: Management of system settings, including profile settings, social media settings, meta management, and backup & restore options.
- Communication Module: Sending emails (using Nodemailer) and SMS (via API), creating announcements, and managing email templates.
- Reports & Export: Generation of various reports (Student, Fee, Staff, Branch, Notice) and exporting them in different formats (PDF, Excel, CSV).
- Security & Logs: Implementation of activity logs, login logs, and data backup (manual + auto) for security and monitoring.

## Style Guidelines:

- Primary color: Deep blue (#3B52D4) to convey trust and authority, inspired by the soft blue and purple theme requested.
- Background color: Light gray (#F0F2F5), a desaturated version of the primary blue, provides a clean and modern aesthetic. The user requested a clean white layout.
- Accent color: Purple (#9B51E0), analogous to the primary blue, will add vibrancy and highlight interactive elements. Per the user request: '#5b36f5 accent color'
- Body and headline font: 'Inter', a sans-serif font, will maintain a modern and neutral appearance, suitable for a professional admin system.
- Use simple line icons from react-icons or lucide-react for a clean and modern look, per the user request.
- Maintain a clean white layout with soft blue and purple accents, as requested by the user. Use rounded cards with shadows for displaying information.
- Incorporate subtle animations using Framer Motion for transitions and interactions to enhance user experience, per the user's technology stack request.