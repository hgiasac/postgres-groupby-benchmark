const randomIndex = (len: number): number =>
  Math.floor(Math.random() * 1000) % len;

// column names
export const ColumnUsername: "username" = "username";
export const ColumnUserRole: "user_role" = "user_role";
export const ColumnOperationName: "operation_name" = "operation_name";
export const ColumnStatusCode: "status_code" = "status_code";

export type LogColumn
  = typeof ColumnUsername
  | typeof ColumnUserRole
  | typeof ColumnOperationName
  | typeof ColumnStatusCode;

// User Roles
export const RoleUser: "user" = "user";
export const RoleAdmin: "admin" = "admin";
export const RoleGuest: "guest" = "guest";

export type UserRole
  = typeof RoleUser
  | typeof RoleAdmin
  | typeof RoleGuest;

export const UserRoles: UserRole[]
  = [RoleUser, RoleAdmin, RoleGuest];

export function randomUserRole(): UserRole {
  const idx = randomIndex(UserRoles.length);
  return UserRoles[idx];
}

// User Names
export const Tom: "Tom" = "Tom";
export const Tony: "Tony" = "Tony";

export const UserNames: string[] = [Tom, Tony];

export function randomUserName(): string {
  const idx = randomIndex(UserNames.length);
  return UserNames[idx];
}

// operation names
export const InsertOp: "Insert" = "Insert";
export const UpdateOp: "Update" = "Update";
export const SelectOp: "Select" = "Select";
export const DeleteOp: "Delete" = "Delete";

export type OperationName
  = typeof InsertOp
  | typeof UpdateOp
  | typeof SelectOp
  | typeof DeleteOp;

export const OperationNames: OperationName[]
  = [InsertOp, UpdateOp, SelectOp, DeleteOp];

export function randomOperationName(): OperationName {
  const idx = randomIndex(OperationNames.length);
  return OperationNames[idx];
}

export const StatusCodes: number[]
  = [200, 201, 204, 400, 401, 403, 500];

export function randomStatusCode(): number {
  const idx = randomIndex(StatusCodes.length);
  return StatusCodes[idx];
}
