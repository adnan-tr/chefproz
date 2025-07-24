A- Secure Portal
1. Downloaded Quotation Page
[X] a. Red Border Around "Bill To" Section:
insted of Bill To:            
┌──────────────────┐            
│ isrf             │
│ 0 s r a f i l     │
│ asdahsd@fasd.com │
│ 05319248363      │
└──────────────────┘

it should be :
Bill To:
isrf  
0 s r a f i l  
asdahsd@fasd.com  
05319248363

FIXED by removing the border around the 'Bill To' section in the PDF generation code.


[ ] b. Add a "Notes" section right under the table or above the footer in pdf downloaded versions and as well Subtotal and Total Not Visible:

[ ] c. Add the website logo as icon at the left upper corner to the exported quotation.as i have downloaded the quotation, i have noticed that the logo is not visible. so when the quptation is sent, it has our own logo

3. Orders Management Dashboard
[ ] a. Add product and edit button has been added but As for adding, i am trying to add products but it is not reflected. but the edit and removing is working. but the reason should be a doplist and the old version of the order should be saved somewhere as history or the removed item will be colored as red but wont reflect in the total and pdd and for the added prodcust to be colored as green and the total ot be updated

[ ] b. Edit Order Window, the payment status (opnly when choosing Completed) nad Supplier Status (opnly when choosing Contacted, In Production and Ready ) and Shipment Status (Preparing) when changed it gives an error when saving

4. For Quotations and Orders, all changes should be saved in a table new or exisiting ones, to get back to it for analytics purpose and to see in the future the average time of each phase and etc.

5. Reports Page
[ ] a. Top Quoted Products, Top Ordered Products, Client Summary buttons color to be changed as it should be suits the general theme and style

6. Main Dashboard
[ ] Add a new Page for website stastics showing the following:
 • Total number of visitors
 • Visitor countries
 • Average time spent
 • Top 10–20 viewed products

B- Main Website

[X] a. Make the header language selector identical in style and format to the footer language buttons. Match padding, shape, colors, spacing, and highlight effect.
[X] c. ONLY in inoksan page, when trying to clicking on next page or page 2, its not wokring, please check, crashed - FIXED by adding the missing ViewModeSelector import and component to InoksanPage.tsx

[X] d. for all products pages, the picture of products, when opening the product card details(when click on view details), the image should fit and centered in side the image frame - FIXED by updating the image styling in ProductModal.tsx


2- Below 550 px Responsive Layout
[X]  some of the languages in the language bar is outsudie the screen
[X] The header menu button in tablet and phone as color be red and when hover (you choose the right color)
[X] the category and subcategory to be removed only from the prouct card

