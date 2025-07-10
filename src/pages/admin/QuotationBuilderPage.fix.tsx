// Fix for the quotation confirmation workflow

/*
The issue is that when a quotation is in 'accepted' status, the "confirm as order" popup is not appearing.
According to the code, the workflow should be:

1. When a quotation is 'accepted', clicking "Convert to Order" should change its status to 'confirm_order'
2. When a quotation is in 'confirm_order' status, clicking "Convert to Order" should open the confirmation modal

However, there seems to be a logic issue in the handleConvertToOrder function.

Here's the fix:

1. Modify the handleConvertToOrder function to properly handle both 'accepted' and 'confirm_order' statuses
2. Update the UI to show different button text/color based on the status
3. Make sure the canConvertToOrder function is working correctly

Replace the handleConvertToOrder function with this:

const handleConvertToOrder = (quotationId: string) => {
  const quotation = quotations.find(q => q.id === quotationId);
  
  if (!quotation) return;
  
  // If the quotation is in 'accepted' status, first change it to 'confirm_order'
  if (quotation.status === 'accepted') {
    updateQuotationStatus(quotationId, 'confirm_order');
  } 
  // If it's already in 'confirm_order' status, proceed with the conversion
  else if (quotation.status === 'confirm_order') {
    setQuotationToConvert(quotation);
    setIsOrderConfirmModalOpen(true);
  }
};

And update the button in the UI to show different text based on the status:

{selectedQuotationObj && canConvertToOrder(selectedQuotationObj) && (
  <Button 
    size="sm" 
    className={selectedQuotationObj.status === 'accepted' 
      ? "bg-orange-500 hover:bg-orange-600 text-white min-w-0" 
      : "bg-green-600 hover:bg-green-700 text-white min-w-0"}
    onClick={() => handleConvertToOrder(selectedQuotationObj.id)}
    disabled={isConvertingToOrder}
  >
    {selectedQuotationObj.status === 'accepted' 
      ? <><CheckSquare className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Confirm Order</span></> 
      : <><ShoppingCart className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Convert to Order</span></>}
  </Button>
)}
*/