
import z from "zod";


export const  UserCreateSchema = z.object({
   authUserId:z.string(),
   name: z.string(),
   email: z.string().email(),
   phone: z.string().optional(),
   address: z.string().optional(),
});


export const UserUpdateSchema =  UserCreateSchema.omit({authUserId: true,}).partial();

 