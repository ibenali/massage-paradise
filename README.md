# Massage Paradise

Massage Paradise is a React-based web application designed to create personalized massage vouchers. Users can select a massage type, choose a date and time, provide personal details, and pick a voucher design. The application generates a preview of the voucher and allows users to download it as a PDF.

## Features

1. **Massage Selection**: Users can choose from a variety of massage options, each with a specified duration and price.  
2. **Date and Time Selection**: Users can choose a preferred date and time for the massage (starting from tomorrow).  
3. **Personal Information Form**: Users can fill out a form with their personal details, including name, email, and phone number.  
4. **Voucher Design**: Users can select a design for their voucher from a set of predefined options and add a personal message (up to 150 characters).  
5. **Voucher Preview**: A preview of the voucher is displayed, showing all the selected details.  
6. **PDF Generation**: The application generates a PDF of the voucher, including a QR code and all relevant details.  

## Technologies Used

- **React**: For building the user interface.  
- **TypeScript**: For type safety and better code maintainability.  
- **jspdf**: For generating the PDF voucher.  
- **qrcode**: For creating QR codes.  
- **lucide-react**: For icons used in the UI.  

## How It Works

1. **Step 1: Massage Selection**  
   Users select a massage type from the available options.

2. **Step 2: Date and Time Selection**  
   Users pick a date (starting from tomorrow) and a time slot.

3. **Step 3: Personal Information**  
   Users fill out a form with their personal details.

4. **Step 4: Voucher Design**  
   Users choose a voucher design and add a personal message (up to 150 characters).

5. **Step 5: Voucher Preview and Download**  
   A preview of the voucher is displayed, and users can download it as a PDF.

## Folder Structure

- **src**: Contains the main application code.  
  - **App.tsx**: The main component that handles the application logic and UI.

## Getting Started

1. Clone the repository.  
2. Install dependencies using `npm install`.  
3. Start the development server with `npm start`.

## Future Enhancements

- Add more voucher designs.  
- Implement user authentication for saving voucher history.  
- Add support for multiple languages.  
