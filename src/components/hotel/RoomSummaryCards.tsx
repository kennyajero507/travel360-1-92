
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RoomType } from "../../types/hotel.types";
import { HotelRoomInventory } from "@/services/inventoryService";
import { BarChart3, BedDouble, AlertTriangle } from "lucide-react";

interface RoomSummaryCardsProps {
  roomTypes: RoomType[];
  inventory: HotelRoomInventory[];
}

const RoomSummaryCards = ({ roomTypes, inventory }: RoomSummaryCardsProps) => {
  // Total rooms
  const totalRooms = roomTypes.reduce((sum, r) => sum + (r.totalUnits || 0), 0);
  // Total out-of-order
  const totalOutOfOrder = roomTypes.filter(r => r.isOutOfOrder).length;

  // Booked today (sample: just sum all booked_units for today)
  const today = new Date().toISOString().slice(0,10);
  const bookedToday = inventory.filter(i => i.inventory_date === today)
    .reduce((sum, i) => sum + (i.booked_units || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          <BedDouble className="h-5 w-5 text-teal-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRooms}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Booked Today</CardTitle>
          <BarChart3 className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookedToday}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rooms Out of Order</CardTitle>
          <AlertTriangle className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOutOfOrder}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomSummaryCards;
