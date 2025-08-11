import { NextFunction,Request,Response } from "express";
import prisma from "../prisma";


const getProducts = async(_req:Request, res:Response, next:NextFunction)=>{
  try {
    
    const products  = await prisma.product.findMany({
        select:{
            id:true,
            sku:true,
            name:true,
            price:true,
            inventoryId: true
        }
    })

    res.json({data:products})

  } catch (error) {
    next(error)
  }
}

export default getProducts;