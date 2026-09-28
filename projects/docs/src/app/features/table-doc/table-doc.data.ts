export type DocUserStatus = 'active' | 'invited' | 'suspended';

export interface DocUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: DocUserStatus;
  age: number;
  joined: Date;
}

const FIRST = ['Ava', 'Ben', 'Chloe', 'Dan', 'Ella', 'Finn', 'Grace', 'Hugo', 'Isla', 'Jack'];
const LAST = ['Nguyen', 'Tran', 'Smith', 'Garcia', 'Kim', 'Olsen', 'Rossi', 'Khan'];
const ROLES: DocUser['role'][] = ['Admin', 'Editor', 'Viewer'];
const STATUSES: DocUserStatus[] = ['active', 'invited', 'suspended'];

/** Deterministic fake users so the docs render the same every time. */
export function makeUsers(count: number): DocUser[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 3) % LAST.length];
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      role: ROLES[i % ROLES.length],
      status: STATUSES[(i * 7) % STATUSES.length],
      age: 21 + ((i * 13) % 40),
      joined: new Date(2020, i % 12, (i % 27) + 1),
    };
  });
}
