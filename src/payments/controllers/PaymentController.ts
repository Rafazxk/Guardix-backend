import type { Request, Response } from "express";

import PaymentService from "../services/PaymentService.js";

class PaymentController {
    async createCheckout(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    message: "Usuário não autenticado.",
                });
            }

            const { plano, periodo } = req.body;

            const checkout = await PaymentService.createCheckout({
                userId,
                plano,
                periodo,
            });

            return res.status(200).json(checkout);
        } catch (error: any) {
            console.error("Erro ao criar checkout:", error);

            return res.status(400).json({
                message: error.message || "Erro ao criar checkout.",
            });
        }
    }
}

export default new PaymentController();