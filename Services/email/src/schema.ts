
import z from "zod";


export const EmailCreateSchema = z.object({
   recipient: z.string().email(),
   subject: z.string(),
   body: z.string(),
   source: z.string(),
   sender: z.string().email().optional(),
})


export const  UserCreateSchema = z.object({
   authUserId:z.string(),
   name: z.string(),
   email: z.string().email(),
   phone: z.string().optional(),
   address: z.string().optional(),
});
