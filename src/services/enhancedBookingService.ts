
// EnhancedBookingService is not implemented because bookings table is missing.
class EnhancedBookingServiceStub {
  async getFilteredBookings() {
    return [];
  }
  async getBookingAnalytics() {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      conversionRate: 0,
      averageBookingValue: 0,
      statusBreakdown: {},
      monthlyTrends: [],
      revenueBySource: [],
    };
  }
  async getRevenueMetrics() {
    return {
      totalRevenue: 0,
      totalBookings: 0,
      averageProfitMargin: 0,
      monthlyRevenue: [],
    };
  }
  async bulkUpdateStatus() {
    return {
      success: false,
      processedCount: 0,
      failedIds: [],
      error: "Bookings functionality not implemented.",
    };
  }
  async bulkUpdateBookingStatus() {
    return {
      success: false,
      processedCount: 0,
      failedIds: [],
      error: "Bookings functionality not implemented.",
    };
  }
  async bulkDelete() {
    return {
      success: false,
      processedCount: 0,
      failedIds: [],
      error: "Bookings functionality not implemented.",
    };
  }
  async exportBookings() {
    throw new Error("Bookings functionality not available.");
  }
  async getPayments() {
    return [];
  }
  async getPaymentsByBooking() {
    return [];
  }
  async recordPayment() {
    throw new Error("Payments functionality not implemented (table missing).");
  }
  async updatePaymentStatus() {
    throw new Error("Payments functionality not implemented (table missing).");
  }
  async sendNotification() {
    return false;
  }
  async getVoucherTemplates() {
    return [];
  }
  async generateVoucherPDF() {
    throw new Error("Vouchers functionality not available.");
  }
}
export const enhancedBookingService = new EnhancedBookingServiceStub();
