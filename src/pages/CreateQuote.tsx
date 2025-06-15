
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { useQuoteData } from '../hooks/useQuoteData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuoteData } from '../types/quote.types';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const formSchema = z.object({
  client: z.string().min(2, "Client name is required."),
  destination: z.string().min(2, "Destination is required."),
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  adults: z.coerce.number().min(1, "At least one adult is required."),
}).refine(data => data.end_date > data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
});

const CreateQuote = () => {
    const navigate = useNavigate();
    const { createQuote, isCreating } = useQuoteData();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client: "",
            destination: "",
            adults: 1,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const newQuote: Partial<QuoteData> = {
            id: `quote-${crypto.randomUUID()}`, // temporary ID for creation
            client: values.client,
            mobile: '0000000000', // Placeholder
            destination: values.destination,
            start_date: values.start_date.toISOString().split('T')[0],
            end_date: values.end_date.toISOString().split('T')[0],
            duration_days: Math.ceil((values.end_date.getTime() - values.start_date.getTime()) / (1000 * 3600 * 24)) + 1,
            duration_nights: Math.ceil((values.end_date.getTime() - values.start_date.getTime()) / (1000 * 3600 * 24)),
            adults: values.adults,
            children_with_bed: 0,
            children_no_bed: 0,
            infants: 0,
            status: 'draft',
            tour_type: 'custom', 
            currency_code: 'USD',
            markup_type: 'percentage',
            markup_value: 0,
            room_arrangements: [],
            activities: [],
            transports: [],
            transfers: [],
        };
        
        try {
            const savedQuote = await createQuote(newQuote as QuoteData);
            toast.success("Quote created successfully! Redirecting to editor...");
            navigate(`/quotes/${savedQuote.id}`);
        } catch (error) {
            // error is already toasted by the hook
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create New Quote</CardTitle>
                    <CardDescription>Start by providing some basic details. You can add more information later.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="client"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name</FormLabel>
                                        <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl><Input placeholder="e.g. Paris, France" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="start_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="adults"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Adults</FormLabel>
                                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <CardFooter className="flex justify-end gap-2 p-0 pt-6">
                                <Button type="button" variant="outline" onClick={() => navigate('/quotes')}>Cancel</Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Create and Continue"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateQuote;
