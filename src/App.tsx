import React, { useState } from 'react';
import { Calendar, Clock, Gift, Euro, ChevronRight, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

type MassageOption = {
  id: number;
  name: string;
  duration: string;
  price: number;
};

type TimeSlot = {
  id: number;
  time: string;
};

type VoucherDesign = {
  id: number;
  name: string;
  imageUrl: string;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

function App() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [step, setStep] = useState<'selection' | 'datetime' | 'form' | 'design' | 'preview'>('selection');
  const [voucherId] = useState(uuidv4());
  
  const massageOptions: MassageOption[] = [
    { id: 1, name: 'Klassische Massage', duration: '60 min', price: 65 },
    { id: 2, name: 'Aromatherapie Massage', duration: '90 min', price: 95 },
    { id: 3, name: 'Hot Stone Massage', duration: '75 min', price: 85 },
  ];

  const timeSlots: TimeSlot[] = [
    { id: 1, time: '09:00' },
    { id: 2, time: '10:00' },
    { id: 3, time: '11:00' },
    { id: 4, time: '14:00' },
    { id: 5, time: '15:00' },
    { id: 6, time: '16:00' },
  ];

  const voucherDesigns: VoucherDesign[] = [
    { 
      id: 1, 
      name: 'Entspannung Pur',
      imageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=400&h=250'
    },
    { 
      id: 2, 
      name: 'Wellness Oase',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&h=250'
    },
    { 
      id: 3, 
      name: 'Zen Moment',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&h=250'
    },
    { 
      id: 4, 
      name: 'Harmonie',
      imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&h=250'
    },
  ];

  const handleDateTimeSubmit = () => {
    if (selectedDate && selectedTime) {
      setStep('form');
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElements = e.currentTarget.elements as typeof e.currentTarget.elements & {
      firstName: HTMLInputElement;
      lastName: HTMLInputElement;
      email: HTMLInputElement;
      phone: HTMLInputElement;
      message: HTMLTextAreaElement;
    };
    
    setFormData({
      firstName: formElements.firstName.value,
      lastName: formElements.lastName.value,
      email: formElements.email.value,
      phone: formElements.phone.value,
      message: formElements.message.value,
    });
    setStep('design');
  };

  const handleVoucherMessageSubmit = () => {
    if (voucherMessage.length <= 150) {
      setStep('preview');
    }
  };

  const getSelectedMassage = () => massageOptions.find(option => option.id === selectedOption);
  const getSelectedDesign = () => voucherDesigns.find(design => design.id === selectedDesign);
  const getSelectedTime = () => timeSlots.find(slot => slot.id === selectedTime);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set background color
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 297, 'F');

    // Add design image at the top
    const selectedDesignData = getSelectedDesign();
    if (selectedDesignData) {
      try {
        const response = await fetch(selectedDesignData.imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onload = () => {
            const imageData = reader.result as string;
            doc.addImage(imageData, 'JPEG', 20, 20, 170, 60);
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Error loading design image:', err);
      }
    }

    // Add semi-transparent overlay on the image
    doc.setFillColor(0, 0, 0);
    doc.setGState({ opacity: 0.3 });
    doc.rect(20, 20, 170, 60, 'F');

    // Reset opacity
    doc.setGState({ opacity: 1 });

    // Add title on top of the image
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('Massage Gutschein', 105, 55, { align: 'center' });

    // Add massage details
    const selectedMassage = getSelectedMassage();
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.text(selectedMassage?.name || '', 30, 100);
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    doc.text(`Dauer: ${selectedMassage?.duration}`, 30, 110);
    doc.text(`Preis: €${selectedMassage?.price}`, 30, 120);

    // Add appointment details
    doc.setFontSize(14);
    doc.text(`Termin: ${selectedDate} um ${getSelectedTime()?.time} Uhr`, 30, 140);

    // Generate QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(voucherId, {
        width: 100,
        margin: 0,
      });
      
      // Add QR code to the center of the page
      doc.addImage(qrCodeDataUrl, 'PNG', 80, 155, 50, 50);
      
      // Add voucher ID below QR code
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Gutschein ID: ${voucherId}`, 105, 210, { align: 'center' });
    } catch (err) {
      console.error('Error generating QR code:', err);
    }

    // Add personal message
    if (voucherMessage) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text(`"${voucherMessage}"`, 30, 230, {
        maxWidth: 150
      });
    }

    // Add recipient information
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Für: ${formData.firstName} ${formData.lastName}`, 30, 250);
    doc.text(`Kontakt: ${formData.email} | ${formData.phone}`, 30, 260);

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text('Dieser Gutschein wurde digital erstellt und ist gültig für ein Jahr ab Ausstellungsdatum.', 105, 280, { align: 'center' });

    // Save the PDF
    doc.save('massage-gutschein.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold text-gray-900">Massage Gutschein</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {step === 'selection' && (
            /* Massage Options */
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Wählen Sie Ihre Massage</h2>
              
              {massageOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{option.name}</h3>
                      <div className="mt-2 flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{option.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Euro className="w-4 h-4 mr-1" />
                          <span>{option.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-6 h-6 border-2 rounded-full border-blue-500">
                      {selectedOption === option.id && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => selectedOption && setStep('datetime')}
                className={`w-full mt-6 py-3 px-6 rounded-md flex items-center justify-center transition-colors ${
                  selectedOption
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedOption}
              >
                Tag wählen
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}

          {step === 'datetime' && (
            /* Date and Time Selection */
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Wählen Sie Datum und Uhrzeit</h2>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  id="date"
                  min={getTomorrowDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verfügbare Zeiten
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTime(slot.id)}
                      className={`py-2 px-4 rounded-md text-center transition-colors ${
                        selectedTime === slot.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('selection')}
                  className="flex-1 py-3 px-6 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Zurück
                </button>
                <button
                  onClick={handleDateTimeSubmit}
                  className={`flex-1 py-3 px-6 rounded-md ${
                    selectedDate && selectedTime
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedDate || !selectedTime}
                >
                  Weiter
                </button>
              </div>
            </div>
          )}

          {step === 'form' && (
            /* Booking Form */
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Persönliche Informationen</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Vorname
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nachname
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Nachricht (optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep('datetime')}
                    className="flex-1 py-3 px-6 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Zurück
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Gutschein Design wählen
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'design' && (
            /* Voucher Design Selection */
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Wählen Sie Ihr Gutschein Design</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {voucherDesigns.map((design) => (
                  <div
                    key={design.id}
                    onClick={() => setSelectedDesign(design.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                      selectedDesign === design.id
                        ? 'ring-4 ring-blue-500 transform scale-[1.02]'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <img
                      src={design.imageUrl}
                      alt={design.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 bg-white border-t">
                      <h3 className="text-lg font-medium text-gray-900">{design.name}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="voucherMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Persönliche Nachricht für den Gutschein (max. 150 Zeichen)
                </label>
                <textarea
                  id="voucherMessage"
                  value={voucherMessage}
                  onChange={(e) => setVoucherMessage(e.target.value)}
                  maxLength={150}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Schreiben Sie hier Ihre persönliche Nachricht..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  {voucherMessage.length}/150 Zeichen
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 px-6 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Zurück
                </button>
                <button
                  onClick={handleVoucherMessageSubmit}
                  className={`flex-1 py-3 px-6 rounded-md flex items-center justify-center ${
                    selectedDesign
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedDesign}
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Vorschau anzeigen
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            /* Voucher Preview */
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Gutschein Vorschau</h2>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="relative">
                  <img
                    src={getSelectedDesign()?.imageUrl}
                    alt={getSelectedDesign()?.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white text-center px-6">
                      Massage Gutschein
                    </h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {getSelectedMassage()?.name}
                      </h4>
                      <p className="text-gray-600">{getSelectedMassage()?.duration}</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      €{getSelectedMassage()?.price}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                      Termin: {selectedDate} um {getSelectedTime()?.time} Uhr
                    </p>
                  </div>

                  {voucherMessage && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-gray-800 italic">"{voucherMessage}"</p>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4 text-sm text-gray-600">
                    <p>Für: {formData.firstName} {formData.lastName}</p>
                    <p>Kontakt: {formData.email} | {formData.phone}</p>
                    <p className="mt-2 text-xs">Gutschein ID: {voucherId}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('design')}
                  className="flex-1 py-3 px-6 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Zurück
                </button>
                <button
                  onClick={generatePDF}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Gutschein herunterladen
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;