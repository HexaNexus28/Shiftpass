import type { Employer } from '../types/employer';

export interface DashboardProps {
  employer: Employer;
  onSignOut: () => void;
}
