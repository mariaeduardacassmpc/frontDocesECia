import { useEffect, useMemo, useState } from "react";
import { useProducts, useSales } from "@/store/useStore";
import { Customer, Sale, SaleItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { salesApi } from "@/services/salesApi";
import { customerApi } from "@/services/customerApi";
import {
  addItemToSale,
  calculateSaleTotal,
  createSalePayload,
  DEFAULT_HISTORY_FILTERS,
  downloadSaleAsTxt,
  filterAndSortSales,
  filterCustomersBySearch,
  filterProductsBySearch,
  formatCurrency,
  PAYMENT_LABELS,
  removeItemFromSale,
  SalePaymentFilter,
  SaleSortBy,
} from "@/services/SalesService";

function mapSaleCustomer(customer: Record<string, any>): Customer {
  return {
    id: Number(
      customer.ClienteId ??
        customer.CustomerId ??
        customer.Id ??
        customer.id
    ),
    name: customer.Name ?? customer.name ?? "Sem nome",
    phone: customer.Phone ?? customer.phone ?? "",
    city: customer.City ?? customer.city ?? "",
    email: customer.Email ?? customer.email ?? "",
    address: customer.Address ?? customer.address ?? "",
    obs: customer.Obs ?? customer.obs ?? "",
    active: customer.Active ?? customer.active ?? true,
  };
}

export function useSalesPage() {
  const { products } = useProducts();
  const { sales, addSale, updateSale } = useSales();
  const { toast } = useToast();

  const [saleCustomers, setSaleCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  const [showProductList, setShowProductList] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] =
    useState<Sale["paymentMethod"]>("pix");

  const [filterPayment, setFilterPayment] =
    useState<SalePaymentFilter>(DEFAULT_HISTORY_FILTERS.payment);
  const [filterSearchTerm, setFilterSearchTerm] = useState(
    DEFAULT_HISTORY_FILTERS.searchTerm
  );
  const [filterDateStart, setFilterDateStart] = useState(
    DEFAULT_HISTORY_FILTERS.dateStart
  );
  const [filterDateEnd, setFilterDateEnd] = useState(
    DEFAULT_HISTORY_FILTERS.dateEnd
  );
  const [sortBy, setSortBy] = useState<SaleSortBy>(
    DEFAULT_HISTORY_FILTERS.sortBy
  );

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [editPaymentMethod, setEditPaymentMethod] =
    useState<Sale["paymentMethod"]>("pix");
  const [editItems, setEditItems] = useState<SaleItem[]>([]);
  const [editProductSearch, setEditProductSearch] = useState("");
  const [editSelectedProductId, setEditSelectedProductId] = useState<
    number | null
  >(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [showEditProductList, setShowEditProductList] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [newSaleDialogOpen, setNewSaleDialogOpen] = useState(false);

  useEffect(() => {
    if (!newSaleDialogOpen && !editDialogOpen) {
      return;
    }

    customerApi
      .getForSale()
      .then((data) => setSaleCustomers(data.map(mapSaleCustomer)))
      .catch((error) => {
        setSaleCustomers([]);

        toast({
          title:
            error instanceof Error
              ? error.message
              : "Erro ao buscar clientes",
          variant: "destructive",
        });
      });
  }, [newSaleDialogOpen, editDialogOpen, toast]);

  const filteredCustomers = useMemo(
    () => filterCustomersBySearch(saleCustomers, customerSearch),
    [saleCustomers, customerSearch]
  );

  const filteredProducts = useMemo(
    () => filterProductsBySearch(products, productSearch),
    [products, productSearch]
  );

  const editFilteredProducts = useMemo(
    () => filterProductsBySearch(products, editProductSearch),
    [products, editProductSearch]
  );

  const total = useMemo(
    () => calculateSaleTotal(items),
    [items]
  );

  const editTotal = useMemo(
    () => calculateSaleTotal(editItems),
    [editItems]
  );

  const sortedSales = useMemo(
    () =>
      filterAndSortSales(sales, {
        payment: filterPayment,
        searchTerm: filterSearchTerm,
        dateStart: filterDateStart,
        dateEnd: filterDateEnd,
        sortBy,
      }),
    [
      sales,
      filterPayment,
      filterSearchTerm,
      filterDateStart,
      filterDateEnd,
      sortBy,
    ]
  );

  const selectCustomer = (customer: Customer) => {
    setCustomerSearch(customer.name);
    setSelectedCustomerId(customer.id);
    setShowCustomerList(false);
  };

  const selectProduct = (product: (typeof products)[number]) => {
    setProductSearch(product.name);
    setSelectedProductId(product.id);
    setShowProductList(false);
  };

  const addItem = () => {
    const product = products.find(
      (item) => item.id === selectedProductId
    );

    if (!product) {
      toast({
        title: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    setItems((current) =>
      addItemToSale(current, product, quantity)
    );

    setProductSearch("");
    setSelectedProductId(null);
    setQuantity(1);
  };

  const removeItem = (productId: string) => {
    setItems((current) =>
      removeItemFromSale(current, productId)
    );
  };

  const removeEditItem = (productId: string) => {
    setEditItems((current) =>
      removeItemFromSale(current, productId)
    );
  };

  const finalizeSale = async () => {
    if (items.length === 0) {
      toast({
        title: "Adicione itens à venda",
        variant: "destructive",
      });
      return;
    }

    try {
      await addSale(
        createSalePayload({
          items,
          total,
          paymentMethod,
          customerSearch,
          selectedCustomerId,
          customers: saleCustomers,
        })
      );

      toast({
        title: "Venda registrada!",
      });

      setItems([]);
      setCustomerSearch("");
      setSelectedCustomerId(null);
      setProductSearch("");
      setSelectedProductId(null);
      setNewSaleDialogOpen(false);
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "Erro ao registrar venda",
        variant: "destructive",
      });
    }
  };

  const openNewSale = () => {
    setCustomerSearch("");
    setSelectedCustomerId(null);
    setProductSearch("");
    setSelectedProductId(null);
    setShowCustomerList(false);
    setShowProductList(false);
    setNewSaleDialogOpen(true);
  };

  const openSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  const openSaleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditCustomerId(sale.customerId ?? null);
    setEditPaymentMethod(sale.paymentMethod);
    setEditItems(sale.items);
    setEditProductSearch("");
    setEditSelectedProductId(null);
    setEditQuantity(1);
    setShowEditProductList(false);
    setEditDialogOpen(true);
  };

  const addEditItem = () => {
    const product = products.find(
      (item) => item.id === editSelectedProductId
    );

    if (!product) {
      toast({
        title: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    setEditItems((current) =>
      addItemToSale(current, product, editQuantity)
    );

    setEditProductSearch("");
    setEditSelectedProductId(null);
    setEditQuantity(1);
    setShowEditProductList(false);
  };

  const saveSaleEdit = async () => {
    if (!editingSale) {
      return;
    }

    const customer = saleCustomers.find(
      (item) => item.id === editCustomerId
    );

    try {
      await updateSale({
        ...editingSale,
        items: editItems,
        total: editTotal,
        customerId: customer?.id,
        customerName: customer?.name,
        paymentMethod: editPaymentMethod,
      });

      toast({
        title: "Venda atualizada!",
      });

      setEditDialogOpen(false);
      setEditingSale(null);
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar venda",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const { blob, filename } = await salesApi.downloadReport();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        filename ||
        `relatorio-vendas-${new Date()
          .toISOString()
          .slice(0, 10)}`;

      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "Erro ao gerar relatório",
        variant: "destructive",
      });
    }
  };

  const downloadSale = (sale: Sale) =>
    downloadSaleAsTxt(sale);

  const clearHistoryFilters = () => {
    setFilterPayment(DEFAULT_HISTORY_FILTERS.payment);
    setSortBy(DEFAULT_HISTORY_FILTERS.sortBy);
    setFilterDateStart(DEFAULT_HISTORY_FILTERS.dateStart);
    setFilterDateEnd(DEFAULT_HISTORY_FILTERS.dateEnd);
    setFilterSearchTerm(DEFAULT_HISTORY_FILTERS.searchTerm);
  };

  return {
    products,
    sales,
    saleCustomers,

    items,
    customerSearch,
    productSearch,
    selectedProductId,
    selectedCustomerId,
    quantity,
    paymentMethod,

    showProductList,
    showCustomerList,

    filteredCustomers,
    filteredProducts,

    total,

    filterPayment,
    filterSearchTerm,
    filterDateStart,
    filterDateEnd,
    sortBy,
    sortedSales,

    selectedSale,
    detailsOpen,

    editingSale,
    editCustomerId,
    editPaymentMethod,
    editItems,
    editProductSearch,
    editSelectedProductId,
    editQuantity,
    editFilteredProducts,
    editTotal,

    showEditProductList,
    editDialogOpen,
    newSaleDialogOpen,

    setCustomerSearch,
    setProductSearch,
    setSelectedCustomerId,
    setSelectedProductId,
    setShowCustomerList,
    setShowProductList,
    setQuantity,
    setPaymentMethod,

    setFilterPayment,
    setFilterSearchTerm,
    setFilterDateStart,
    setFilterDateEnd,
    setSortBy,

    setDetailsOpen,

    setEditCustomerId,
    setEditPaymentMethod,
    setEditProductSearch,
    setEditSelectedProductId,
    setEditQuantity,
    setShowEditProductList,
    setEditDialogOpen,
    setNewSaleDialogOpen,

    setEditItems,

    selectCustomer,
    selectProduct,

    addItem,
    removeItem,
    removeEditItem,

    finalizeSale,

    openNewSale,
    openSaleDetails,
    openSaleEdit,

    addEditItem,
    saveSaleEdit,

    downloadSale,
    handleDownloadReport,
    clearHistoryFilters,

    paymentLabels: PAYMENT_LABELS,
    fmt: formatCurrency,
  };
}