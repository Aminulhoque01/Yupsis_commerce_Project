import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import axios from "axios";
import { INVENTORY_URL } from "../config";

  

const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Origin', req.headers.origin);

    const { id } = req.params;  // Get the product ID from the URL

    // Fetch the product from the database
    const product = await prisma.product.findUnique({
      where: { id }
    });

    // If the product is not found, return an error
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If the product doesn't have an inventory, create one
    if (product?.inventoryId === null) {
      const { data: inventory } = await axios.post(
        `${INVENTORY_URL}/inventories`,
        {
          productId: product.id,
          sku: product.sku,
        }
      );
      
      console.log(`Inventory created successfully`, inventory.id);

      // Update product with the new inventory id
      await prisma.product.update({
        where: { id: product.id },
        data: { inventoryId: inventory.id },
      });

      console.log(`Product updated successfully with inventory id`, inventory.id);

      // Return the product details along with the inventory details
      return res.status(200).json({
        ...product,
        inventoryId: inventory.id,
        stock: inventory.quantity || 0,
        stockStatus: inventory.quantity > 0 ? "In stock" : "Out of stock",
      });
    }

    // If product already has an inventory, fetch inventory details
    const inventory = await axios.get(`${INVENTORY_URL}/inventories/${product.inventoryId}`);

    // Return the product details along with inventory details
    return res.status(200).json({
      ...product,
      inventoryId: inventory.data.id,
      stock: inventory.data.quantity || 0,
      stockStatus: inventory.data.quantity > 0 ? "In stock" : "Out of stock",
    });

  } catch (error) {
    next(error);  // Pass the error to the next middleware
  }
};

export default getProductDetails;
