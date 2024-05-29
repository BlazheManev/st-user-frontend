export interface Employee {
  _id: string;
  ime: string;
  priimek: string;
  email: string;
  dan: {
    datum: Date;
    vhodi: string[];
    izhodi: string[];
  }[];
  equipment: {
    name: string;
    from: Date;
    to: Date;
  }[];
  education: {
    institution: string;
    grade: string;
    title: string;
    from: Date;
    to: Date;
  }[];
  roles: string[];
  wagePerHour: number;
  vacationDaysLeft: number;
}
