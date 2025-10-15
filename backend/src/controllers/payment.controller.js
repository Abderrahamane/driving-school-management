import Payment from "../models/payment.model.js";

export const getPayments = async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
};

export const addPayment = async (req, res) => {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.json(newPayment);
};

export const updatePayment = async (req, res) => {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

export const deletePayment = async (req, res) => {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
};
