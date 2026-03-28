import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { isSandbox } from "@/lib/config";

const accessToken = isSandbox()
  ? (process.env.MERCADOPAGO_TEST_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN!)
  : process.env.MERCADOPAGO_ACCESS_TOKEN!;

const client = new MercadoPagoConfig({ accessToken });

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
