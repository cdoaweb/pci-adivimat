import bcrypt from 'bcryptjs';
import { type HydratedDocument, type Model, Schema, model } from 'mongoose';

/**
 * `password` guarda siempre el hash, nunca el texto plano. El tipo
 * `UserPublic` de `@adivimat/shared` no incluye el campo, de modo que
 * devolver el hash por error en una respuesta no compila.
 */
export interface IUser {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface IUserMethods {
  comparePassword(candidata: string): Promise<boolean>;
}

export type UserDoc = HydratedDocument<IUser, IUserMethods>;

export type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

/**
 * Devuelve una promesa en vez de aceptar un callback.
 *
 * La version anterior tomaba `(candidatePassword, cb)` mientras que quien la
 * usaba trabajaba con async/await, asi que el metodo estaba muerto y el
 * controlador llamaba a bcrypt por su cuenta.
 */
UserSchema.methods.comparePassword = function comparePassword(
  this: UserDoc,
  candidata: string,
): Promise<boolean> {
  return bcrypt.compare(candidata, this.password);
};

export const User = model<IUser, UserModel>('User', UserSchema);

/**
 * Indica si ya existe algun administrador.
 *
 * Vive junto al modelo, y no en un controlador, porque la consultan tanto el
 * middleware que autoriza el alta como el propio controlador de registro.
 */
export async function hayAdministradores(): Promise<boolean> {
  return (await User.exists({ isAdmin: true })) !== null;
}
