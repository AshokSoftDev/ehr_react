import { lazy } from 'react';
import { LayoutDashboardIcon, Users, Settings, ThermometerIcon, CalendarDays, NotebookPen, Receipt, Bot } from 'lucide-react';
import { type RouteConfig } from '../interface/routes.interface';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() =>
  import('../features/users/pages/UsersPage').then(module => ({
    default: module.UsersPage
  }))
);

const GroupManagement = lazy(() =>
  import('../features/groups/pages/GroupsPage').then(module => ({
    default: module.GroupsPage
  }))
);

const Doctors = lazy(() => import('../features/doctors/pages/DoctorsPage').then(module => ({ default: module.DoctorsPage })))
const DoctorsDetails = lazy(() => import('../features/doctors/pages/DoctorDetailsPage').then(module => ({ default: module.DoctorDetailsPage })))
const PatientsPage = lazy(() => import('../features/patients/pages/PatientsPage').then(module => ({ default: module.PatientsPage })))
const PatientDetailsLayout = lazy(() => import('../features/patients/pages/PatientDetailsLayout').then(module => ({ default: module.PatientDetailsLayout })))
const PatientDashboard = lazy(() => import('../features/patients/pages/dashboard/PatientDashboard').then(module => ({ default: module.PatientDashboard })))
const PatientVisitPage = lazy(() => import('../features/patients/pages/visit/PatientVisitPage').then(module => ({ default: module.PatientVisitPage })))
const PatientHistoryPage = lazy(() => import('../features/patients/pages/history/PatientHistoryPage').then(module => ({ default: module.PatientHistoryPage })))
const PatientVitalsPage = lazy(() => import('../features/patients/pages/vitals/PatientVitalsPage').then(module => ({ default: module.PatientVitalsPage })))
const PatientDocumentsPage = lazy(() => import('../features/patients/pages/document/PatientDocumentsPage').then(module => ({ default: module.PatientDocumentsPage })))
const PatientPrescriptionsPage = lazy(() => import('../features/patients/pages/prescription/PatientPrescriptionsPage').then(module => ({ default: module.PatientPrescriptionsPage })))
const PatientClinicalNotesPage = lazy(() => import('../features/patients/pages/notes/PatientClinicalNotesPage').then(module => ({ default: module.PatientClinicalNotesPage })))
const PatientConsentPage = lazy(() => import('../features/patients/pages/consent/PatientConsentPage').then(module => ({ default: module.PatientConsentPage })))
const AppointmentsPage = lazy(() => import('../features/appointments/pages/AppointmentsPage').then(module => ({ default: module.AppointmentsPage })))
const VisitsPage = lazy(() => import('../features/visits/pages/VisitsPage').then(module => ({ default: module.VisitsPage })))
const DrugsPage = lazy(() => import('../features/drug/pages/DrugsPage').then(module => ({ default: module.DrugsPage })))
const DocumentTypesPage = lazy(() => import('../features/document-types/pages/DocumentTypesPage').then(module => ({ default: module.DocumentTypesPage })))
const LocationsPage = lazy(() => import('../features/locations/pages/LocationsPage').then(module => ({ default: module.LocationsPage })))
const ClinicalNotesPage = lazy(() => import('../features/clinical-notes/pages/ClinicalNotesPage').then(module => ({ default: module.ClinicalNotesPage })))
const BillingPage = lazy(() => import('../features/billing/pages/BillingPage').then(module => ({ default: module.BillingPage })))
const InvoicePage = lazy(() => import('../features/billing/pages/InvoicePage'))
const AIChatPage = lazy(() => import('../features/ai-chat/pages/AIChatPage').then(module => ({ default: module.AIChatPage })))

export const routes: RouteConfig[] = [
  {
    id: 'Dashboard',
    path: '/main/Dashboard',
    name: 'Dashboard',
    icon: LayoutDashboardIcon,
    component: Dashboard,
    roles: [1],
    showInNav: true,
    module: 'Dashboard', // Add module name
  },
  {
    id: 'user-management',
    path: '/main/users',
    name: 'User Management',
    icon: Users,
    component: UserManagement,
    roles: [1],
    showInNav: true,
    module: 'User Management', // Add module name
  },
  {
    id: 'doctor-management',
    path: '/main/doctor',
    name: 'Doctor Management',
    icon: ThermometerIcon,
    component: Doctors,
    roles: [1],
    showInNav: true,
    module: 'Doctor Management',
  },
  {
    id: 'doctor-details-management',
    path: '/main/doctor/:id',
    name: 'Doctor Management',
    icon: ThermometerIcon,
    component: DoctorsDetails,
    roles: [1],
    showInNav: false,
    module: 'Doctor Details Management',
  },
  {
    id: 'patient-management',
    path: '/main/patients',
    name: 'Patient Management',
    icon: Users,
    component: PatientsPage,
    roles: [1],
    showInNav: true,
    module: 'Patient Management',
  },
  {
    id: 'clinical-notes',
    path: '/main/clinical-notes',
    name: 'Clinical Notes',
    icon: NotebookPen,
    component: ClinicalNotesPage,
    roles: [1],
    showInNav: true,
    module: 'Clinical Notes',
  },
  {
    id: 'ai-chat',
    path: '/main/ai-chat',
    name: 'AI Assistant',
    icon: Bot,
    component: AIChatPage,
    roles: [1],
    showInNav: false, // Now using floating widget instead
    module: 'AI Chat',
  },
  {
    id: 'patient-details',
    path: '/main/patients/:id',
    name: 'Patient Details',
    icon: Users,
    component: PatientDetailsLayout,
    roles: [1],
    showInNav: false,
    module: 'Patient Management',
    children: [
      { id: 'patient-dashboard', path: '/main/patients/:id/dashboard', name: 'Dashboard', icon: Users, component: PatientDashboard, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-visit', path: '/main/patients/:id/visit', name: 'Visit', icon: Users, component: PatientVisitPage, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-history', path: '/main/patients/:id/history', name: 'History', icon: Users, component: PatientHistoryPage, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-vitals', path: '/main/patients/:id/vitals', name: 'Vitals', icon: Users, component: PatientVitalsPage, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-document', path: '/main/patients/:id/document', name: 'Document', icon: Users, component: PatientDocumentsPage, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-prescription', path: '/main/patients/:id/prescription', name: 'Prescription', icon: Users, component: PatientPrescriptionsPage, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-notes', path: '/main/patients/:id/notes', name: 'Clinical Notes', icon: Users, component: PatientClinicalNotesPage, roles: [1], showInNav: false, module: 'Patient Management' },
      { id: 'patient-consent', path: '/main/patients/:id/consent', name: 'Consent', icon: Users, component: PatientConsentPage, roles: [1], showInNav: false, module: 'Patient Management' },
    ],
  },
  {
    id: 'appointments',
    path: '/main/appointments',
    name: 'Appointments',
    icon: Users,
    component: AppointmentsPage,
    roles: [1],
    showInNav: true,
    module: 'Appointments',
  },
  {
    id: 'visits',
    path: '/main/visits',
    name: 'Visits',
    icon: CalendarDays,
    component: VisitsPage,
    roles: [1],
    showInNav: true,
    module: 'Visits',
  },
  {
    id: 'billing',
    path: '/main/billing',
    name: 'Billing',
    icon: Receipt,
    roles: [1],
    showInNav: true,
    module: 'Billing',
    children: [
      {
        id: 'billing-index',
        path: '/main/billing',
        name: 'Billing',
        icon: Receipt,
        component: BillingPage,
        roles: [1],
        showInNav: false,
        module: 'Billing',
      },
      {
        id: 'billing-invoice',
        path: '/main/billing/invoice',
        name: 'Invoice',
        icon: Receipt,
        component: InvoicePage,
        roles: [1],
        showInNav: false,
        module: 'Billing',
      },
    ],
  },
  {
    id: 'settings',
    path: '/main/settings',
    name: 'Settings',
    icon: Settings,
    roles: [1],
    showInNav: true,
    module: 'Settings',
    children: [
      {
        id: 'group-management',
        path: '/main/settings/groups',
        name: 'Group Management',
        icon: Users,
        component: GroupManagement,
        roles: [1],
        showInNav: true,
        module: 'Settings', // Add module name
      },
      {
        id: 'location-master',
        path: '/main/settings/locations',
        name: 'Location Master',
        icon: Users,
        component: LocationsPage,
        roles: [1],
        showInNav: true,
        module: 'Settings',
      },
      {
        id: 'drug-master',
        path: '/main/settings/drugs',
        name: 'Drug Master',
        icon: Users,
        component: DrugsPage,
        roles: [1],
        showInNav: true,
        module: 'Settings',
      },
      {
        id: 'document-type-master',
        path: '/main/settings/document-types',
        name: 'Document Type Master',
        icon: Users,
        component: DocumentTypesPage,
        roles: [1],
        showInNav: true,
        module: 'Settings',
      },
    ],
  },
];
