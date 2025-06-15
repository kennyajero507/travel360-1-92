
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { RoomType } from '../../types/hotel.types';
import { useInventoryData } from '../../hooks/useInventoryData';
import { format, startOfMonth, addMonths, subMonths, getYear, getMonth, isEqual, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { DayPicker, DayProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HotelRoomInventory } from '@/services/inventoryService';

interface InventoryCalendarProps {
    hotelId: string;
    roomTypes: RoomType[];
}

const InventoryCalendar = ({ hotelId, roomTypes }: InventoryCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | undefined>(roomTypes[0]?.id);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [bookedUnitsInput, setBookedUnitsInput] = useState<string>('');

    const { inventory, isLoading, isError, updateInventory, isUpdating } = useInventoryData(
        hotelId,
        getYear(currentMonth),
        getMonth(currentMonth)
    );

    const inventoryMap = useMemo(() => {
        if (!selectedRoomTypeId) return new Map<string, HotelRoomInventory>();
        const map = new Map<string, HotelRoomInventory>();
        inventory
            .filter(inv => inv.room_type_id === selectedRoomTypeId)
            .forEach(inv => {
                map.set(inv.inventory_date, inv);
            });
        return map;
    }, [inventory, selectedRoomTypeId]);

    const selectedRoomType = roomTypes.find(rt => rt.id === selectedRoomTypeId);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        const dateString = format(date, 'yyyy-MM-dd');
        const existingInventory = inventoryMap.get(dateString);
        setBookedUnitsInput(existingInventory?.booked_units.toString() ?? '0');
    };

    const handleUpdateInventory = async () => {
        if (!selectedDate || !selectedRoomTypeId) {
            toast.error("Please select a room type and a date.");
            return;
        }

        const bookedUnits = parseInt(bookedUnitsInput, 10);
        if (isNaN(bookedUnits) || bookedUnits < 0) {
            toast.error("Please enter a valid number for booked units.");
            return;
        }

        if (selectedRoomType && bookedUnits > selectedRoomType.totalUnits) {
            toast.error(`Booked units cannot exceed total units (${selectedRoomType.totalUnits}).`);
            return;
        }
        
        const dateString = format(selectedDate, 'yyyy-MM-dd');

        try {
            await updateInventory({ roomTypeId: selectedRoomTypeId, date: dateString, bookedUnits });
            toast.success(`Inventory updated for ${format(selectedDate, 'PPP')}`);
        } catch (error) {
            toast.error("Failed to update inventory.");
        }
    };

    const DayWithInventory = (props: DayProps) => {
        const dateString = format(props.date, 'yyyy-MM-dd');
        const inventoryItem = inventoryMap.get(dateString);
        const totalUnits = selectedRoomType?.totalUnits ?? 0;
        const bookedUnits = inventoryItem?.booked_units ?? 0;
        const availableUnits = totalUnits - bookedUnits;
        
        return (
            <div className="relative h-full w-full flex flex-col justify-center items-center">
                <DayPicker.Day {...props} />
                {selectedRoomTypeId && props.displayMonth.getMonth() === props.date.getMonth() && (
                    <div className="absolute bottom-0.5 left-0 right-0 text-xs text-center">
                        <span className="text-green-600 font-semibold">{availableUnits}</span>/<span className="text-red-600">{bookedUnits}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory & Availability Calendar</CardTitle>
                <CardDescription>Manage daily room availability. Select a room type to view and edit its inventory.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <Select onValueChange={setSelectedRoomTypeId} defaultValue={selectedRoomTypeId}>
                            <SelectTrigger className="w-full md:w-[280px]">
                                <SelectValue placeholder="Select a room type" />
                            </SelectTrigger>
                            <SelectContent>
                                {roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>
                            <span className="text-lg font-medium w-32 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                    {isLoading && <p>Loading inventory...</p>}
                    {isError && <p className="text-red-500">Failed to load inventory.</p>}
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        className="p-0"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "hidden",
                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                            cell: "h-16 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-16 w-full p-0 font-normal aria-selected:opacity-100",
                        }}
                        components={{
                            Day: DayWithInventory,
                            IconLeft: () => null,
                            IconRight: () => null,
                        }}
                    />
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        <span className="text-green-600 font-semibold">Available</span> / <span className="text-red-600">Booked</span>
                    </div>
                </div>
                <div className="md:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Edit Inventory</CardTitle>
                            <CardDescription>
                                {selectedDate ? `For ${format(selectedDate, 'PPP')}` : 'Select a date'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label htmlFor="bookedUnits" className="block text-sm font-medium text-gray-700">Booked Units</label>
                                <Input
                                    id="bookedUnits"
                                    type="number"
                                    value={bookedUnitsInput}
                                    onChange={(e) => setBookedUnitsInput(e.target.value)}
                                    disabled={!selectedDate || !selectedRoomTypeId || isUpdating}
                                    className="mt-1"
                                />
                                {selectedRoomType && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Total units for this room type: {selectedRoomType.totalUnits}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleUpdateInventory}
                                disabled={!selectedDate || !selectedRoomTypeId || isUpdating}
                                className="w-full"
                            >
                                {isUpdating ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
};

export default InventoryCalendar;
