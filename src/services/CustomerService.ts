import { Customer } from "@/types";

export type CustomerForm = Omit<Customer, "id">;

type SaveCustomerParams = {
  form: CustomerForm;
  editing: Customer | null;
  addCustomer: (data: CustomerForm) => Promise<any>;
  updateCustomer: (data: Customer) => Promise<any>;
};


export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}


export function validateCustomer(form: CustomerForm): string | null {
  if (!form.name.trim()) {
    return "Nome é obrigatório";
  }

  if (!form.email.trim()) {
    return "Email é obrigatório";
  }

  if (!/\S+@\S+\.\S+/.test(form.email)) {
    return "Email inválido";
  }

  if (!form.phone.trim()) {
    return "Telefone é obrigatório";
  }

  const phoneNumbers = form.phone.replace(/\D/g, "");

  if (phoneNumbers.length < 10) {
    return "Telefone inválido";
  }

  if (!form.city.trim()) {
    return "Cidade é obrigatória";
  }

  if (!form.address.trim()) {
    return "Endereço é obrigatório";
  }

  return null;
}


export async function saveCustomer({
  form,
  editing,
  addCustomer,
  updateCustomer,
}: SaveCustomerParams) {
  if (editing?.id) {
    return await updateCustomer({
      id: editing.id,
      ...form,
    });
  }

  return await addCustomer(form);
}