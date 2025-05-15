
interface TotalSummaryProps {
  totalGuests: {
    adults: number;
    childrenWithBed: number;
    childrenNoBed: number;
    infants: number;
  };
  totalAmount: number;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({ totalGuests, totalAmount }) => {
  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-md">
      <div className="flex justify-between items-center text-blue-800">
        <div>
          <p className="font-medium">Total Guests:</p>
          <p className="text-sm">
            {totalGuests.adults} Adults
            {totalGuests.childrenWithBed > 0 ? `, ${totalGuests.childrenWithBed} Child with Bed` : ""}
            {totalGuests.childrenNoBed > 0 ? `, ${totalGuests.childrenNoBed} Child No Bed` : ""}
            {totalGuests.infants > 0 ? `, ${totalGuests.infants} Infants` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">Total Amount:</p>
          <p className="text-lg">${totalAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default TotalSummary;
