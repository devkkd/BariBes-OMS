# Implementation Plan: Delivery Management System

## Overview

This implementation plan breaks down the Delivery Management System into discrete, incremental coding tasks. The system extends the existing lehenga order management application with dedicated delivery tracking, information capture, and receipt generation capabilities. Tasks are organized by implementation priority: database foundation, API endpoints, navigation, UI components, receipt generation, and testing.

## Tasks

- [x] 1. Extend Order model with deliveryInfo schema
  - Add deliveryInfo subdocument to Order schema in `/src/models/Order.js`
  - Include fields: deliveredDate, deliveredBy, remainingPaymentAmount, deliveryPersonName, deliveryPersonMobile, videoReviewUrl, deliveryNotes, markedDeliveredBy, markedDeliveredAt
  - Set appropriate default values (null for dates/refs, empty string for notes)
  - Add database indexes for status and deliveryInfo.deliveredDate
  - Ensure backward compatibility with existing orders
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_
  - _Complexity: Simple_

- [ ]* 1.1 Write property test for Order schema extension
  - **Property 30: Backward Compatibility with Missing DeliveryInfo**
  - **Validates: Requirements 9.9, 9.10**
  - Test that existing orders without deliveryInfo return null/default values without errors
  - _Complexity: Simple_

- [ ] 2. Create API endpoint for fetching ready orders
  - [x] 2.1 Create GET endpoint at `/src/app/api/delivery/ready/route.js`
    - Implement authentication middleware check (staff/admin only)
    - Query orders with status "Ready"
    - Select necessary fields: orderId, subOrderNumber, displayId, customerName, customerPhone, deliveryDate, totalAmount, remainingDue
    - Sort by deliveryDate ascending
    - Return JSON response with orders array and count
    - _Requirements: 13.1, 13.7, 13.8, 2.2, 2.6_
    - _Complexity: Medium_

  - [ ]* 2.2 Write property test for ready orders filtering
    - **Property 3: Ready Orders Filtering**
    - **Validates: Requirements 2.2**
    - Test that endpoint returns all and only orders with status "Ready"
    - _Complexity: Simple_

  - [ ]* 2.3 Write property test for ready orders sorting
    - **Property 6: Ready Orders Sorting**
    - **Validates: Requirements 2.6**
    - Test that orders are sorted by deliveryDate in ascending order
    - _Complexity: Simple_

  - [ ]* 2.4 Write unit tests for ready orders endpoint
    - Test authentication enforcement (401 for unauthorized)
    - Test successful response structure
    - Test empty results when no ready orders exist
    - _Requirements: 13.7, 13.8_
    - _Complexity: Medium_

- [ ] 3. Create API endpoint for fetching delivered orders
  - [x] 3.1 Create GET endpoint at `/src/app/api/delivery/delivered/route.js`
    - Implement authentication middleware check (staff/admin only)
    - Query orders with status "Delivered"
    - Include deliveryInfo fields in response
    - Calculate stats: deliveredToday count and totalDelivered count
    - Sort by deliveryInfo.deliveredDate descending
    - Return JSON response with orders, stats
    - _Requirements: 13.2, 13.7, 13.8, 3.2, 3.4, 3.5, 3.11_
    - _Complexity: Medium_

  - [ ]* 3.2 Write property test for delivered orders filtering
    - **Property 7: Delivered Orders Filtering**
    - **Validates: Requirements 3.2**
    - Test that endpoint returns all and only orders with status "Delivered"
    - _Complexity: Simple_

  - [ ]* 3.3 Write property test for delivered orders sorting
    - **Property 11: Delivered Orders Sorting**
    - **Validates: Requirements 3.6**
    - Test that orders are sorted by deliveredDate in descending order
    - _Complexity: Simple_

  - [ ]* 3.4 Write property test for delivered today count
    - **Property 9: Delivered Today Count Accuracy**
    - **Validates: Requirements 3.4**
    - Test that deliveredToday stat equals count of orders delivered today
    - _Complexity: Simple_

  - [ ]* 3.5 Write unit tests for delivered orders endpoint
    - Test authentication enforcement
    - Test stats calculation accuracy
    - Test response structure
    - _Requirements: 13.7, 13.8_
    - _Complexity: Medium_

- [ ] 4. Create API endpoint for marking orders as delivered
  - [x] 4.1 Create POST endpoint at `/src/app/api/delivery/mark-delivered/route.js`
    - Implement authentication middleware check (staff/admin only)
    - Validate request body: orderId, deliveryInfo fields
    - Validate deliveredDate (not future), phone number format (/^[6-9]\d{9}$/), required fields
    - Find order by ID and verify it exists
    - Update order status to "Delivered"
    - Save deliveryInfo with all fields including markedDeliveredBy and markedDeliveredAt
    - Return updated order with success message
    - Handle errors: 400 for validation, 404 for not found, 500 for server errors
    - _Requirements: 13.3, 13.5, 13.6, 13.7, 13.8, 5.9, 5.10, 6.1, 6.2, 6.3, 12.1, 12.2_
    - _Complexity: Complex_

  - [ ]* 4.2 Write property test for phone number validation
    - **Property 17: Phone Number Validation**
    - **Validates: Requirements 5.6, 5.9**
    - Test that invalid phone numbers are rejected with validation error
    - _Complexity: Simple_

  - [ ]* 4.3 Write property test for required fields validation
    - **Property 18: Required Fields Validation**
    - **Validates: Requirements 5.10**
    - Test that missing required fields block submission
    - _Complexity: Simple_

  - [ ]* 4.4 Write property test for status update
    - **Property 19: Status Update on Delivery**
    - **Validates: Requirements 6.1**
    - Test that order status is updated to "Delivered" after marking
    - _Complexity: Simple_

  - [ ]* 4.5 Write property test for delivery info persistence
    - **Property 20: Delivery Info Persistence**
    - **Validates: Requirements 6.2**
    - Test that all deliveryInfo fields are saved correctly
    - _Complexity: Medium_

  - [ ]* 4.6 Write property test for audit trail recording
    - **Property 37: Audit Trail Recording**
    - **Validates: Requirements 12.1, 12.2**
    - Test that markedDeliveredBy and markedDeliveredAt are populated
    - _Complexity: Simple_

  - [ ]* 4.7 Write unit tests for mark-delivered endpoint
    - Test validation errors (400 responses)
    - Test not found errors (404 responses)
    - Test successful delivery marking
    - Test error handling for database failures
    - _Requirements: 13.5, 13.6, 6.7_
    - _Complexity: Complex_

- [ ] 5. Checkpoint - Ensure API tests pass
  - Run all API endpoint tests
  - Verify database schema changes are working
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Add Delivery menu item to Sidebar navigation
  - Update `/src/components/Sidebar.jsx` to add Delivery menu item
  - Position between "Production" and "Tailors" in menuItems array
  - Use Truck icon from lucide-react
  - Set path to '/dashboard/delivery'
  - Set roles to ['admin', 'staff']
  - Ensure active state highlighting works correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - _Complexity: Simple_

- [ ]* 6.1 Write property test for active menu highlighting
  - **Property 2: Active Menu Highlighting**
  - **Validates: Requirements 1.3**
  - Test that Delivery menu item has active state when on /dashboard/delivery
  - _Complexity: Simple_

- [ ] 7. Create Delivery page with tab navigation
  - [x] 7.1 Create main Delivery page at `/src/app/dashboard/delivery/page.jsx`
    - Set up page component with authentication check
    - Implement tab state management (activeTab: 'ready' | 'delivered')
    - Create tab navigation UI with "Ready for Delivery" and "Delivered Orders" tabs
    - Apply brown gradient theme (#975a20 to #7d4a1a) to active tab
    - Set up state for orders, loading, search, filters
    - Implement useEffect hooks to fetch data on mount and tab change
    - _Requirements: 1.4, 2.1, 3.1, 11.1, 11.2_
    - _Complexity: Medium_

  - [ ] 7.2 Create statistics cards component
    - Display ready count card for Ready tab
    - Display delivered today and total delivered cards for Delivered tab
    - Use consistent card styling with icons
    - Update stats when data changes
    - _Requirements: 2.4, 3.4, 3.5, 11.4_
    - _Complexity: Simple_

  - [ ]* 7.3 Write property test for ready orders count
    - **Property 5: Ready Orders Count Accuracy**
    - **Validates: Requirements 2.4**
    - Test that ready count equals number of orders with status "Ready"
    - _Complexity: Simple_

  - [ ]* 7.4 Write property test for total delivered count
    - **Property 10: Total Delivered Count Accuracy**
    - **Validates: Requirements 3.5**
    - Test that total delivered count equals all orders with status "Delivered"
    - _Complexity: Simple_

- [ ] 8. Implement search and filter functionality
  - [ ] 8.1 Create search and filter UI components
    - Add search input for order ID and customer name
    - Add date range picker for delivery/delivered date filtering
    - Add clear filters button
    - Display filtered results count
    - Apply consistent styling with existing pages
    - _Requirements: 4.1, 4.2, 4.6, 11.3, 11.5_
    - _Complexity: Medium_

  - [ ] 8.2 Implement filter logic
    - Create applyFilters function for search query (case-insensitive)
    - Implement date range filtering for both tabs
    - Ensure filters apply independently to each tab
    - Update filtered results count display
    - Debounce search input to optimize performance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 15.5_
    - _Complexity: Medium_

  - [ ]* 8.3 Write property test for search filtering
    - **Property 12: Search Filter by Order ID and Customer Name**
    - **Validates: Requirements 4.1, 4.3**
    - Test that search returns only matching orders (case-insensitive)
    - _Complexity: Medium_

  - [ ]* 8.4 Write property test for date range filtering
    - **Property 13: Date Range Filtering**
    - **Validates: Requirements 4.2, 4.4**
    - Test that date filter returns only orders within range
    - _Complexity: Medium_

  - [ ]* 8.5 Write property test for independent filter application
    - **Property 14: Independent Filter Application**
    - **Validates: Requirements 4.5**
    - Test that Ready and Delivered filters don't affect each other
    - _Complexity: Simple_

- [ ] 9. Create Ready for Delivery order list
  - [ ] 9.1 Implement ready orders list component
    - Display order cards with orderId, customerName, customerPhone, deliveryDate, totalAmount
    - Show "Mark as Delivered" button for each order
    - Handle empty state when no ready orders
    - Apply responsive grid layout
    - _Requirements: 2.2, 2.3, 10.1, 10.4_
    - _Complexity: Medium_

  - [ ]* 9.2 Write property test for ready order display fields
    - **Property 4: Ready Order Display Fields**
    - **Validates: Requirements 2.3**
    - Test that all required fields are displayed for each ready order
    - _Complexity: Simple_

  - [ ]* 9.3 Write unit tests for ready orders list
    - Test rendering with orders
    - Test empty state
    - Test button click handlers
    - _Complexity: Medium_

- [ ] 10. Create Delivered Orders list
  - [ ] 10.1 Implement delivered orders list component
    - Display order cards with orderId, customerName, deliveredDate, deliveredBy, deliveryPersonName
    - Show "Generate Receipt" button for each order
    - Display delivery information in card
    - Handle empty state when no delivered orders
    - Apply responsive grid layout
    - _Requirements: 3.2, 3.3, 8.1, 10.1, 10.4, 12.3, 12.4_
    - _Complexity: Medium_

  - [ ]* 10.2 Write property test for delivered order display fields
    - **Property 8: Delivered Order Display Fields**
    - **Validates: Requirements 3.3, 12.3, 12.4**
    - Test that all required fields including delivery info are displayed
    - _Complexity: Simple_

  - [ ]* 10.3 Write unit tests for delivered orders list
    - Test rendering with orders
    - Test empty state
    - Test receipt button functionality
    - _Complexity: Medium_

- [ ] 11. Create Delivery Modal component
  - [ ] 11.1 Create DeliveryModal component at `/src/components/DeliveryModal.jsx`
    - Implement modal open/close functionality
    - Create form with all delivery info fields
    - Set deliveredDate default to current date
    - Pre-fill remainingPaymentAmount from order.remainingDue
    - Add dropdown/input for deliveredBy
    - Add inputs for deliveryPersonName, deliveryPersonMobile
    - Add optional fields: videoReviewUrl, deliveryNotes
    - Apply consistent form styling with existing modals
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 11.3, 11.5_
    - _Complexity: Complex_

  - [ ] 11.2 Implement form validation
    - Validate required fields: deliveredDate, deliveredBy, deliveryPersonName, deliveryPersonMobile
    - Validate phone number format: /^[6-9]\d{9}$/
    - Validate deliveredDate is not in future
    - Validate videoReviewUrl format if provided
    - Limit deliveryNotes to 500 characters
    - Display inline validation errors
    - Highlight invalid fields with red border
    - Prevent submission if validation fails
    - _Requirements: 5.9, 5.10, 14.5_
    - _Complexity: Medium_

  - [ ]* 11.3 Write property test for remaining payment pre-fill
    - **Property 16: Remaining Payment Pre-fill**
    - **Validates: Requirements 5.4**
    - Test that remainingPaymentAmount is pre-filled with order.remainingDue
    - _Complexity: Simple_

  - [ ]* 11.4 Write property test for validation error highlighting
    - **Property 33: Validation Error Highlighting**
    - **Validates: Requirements 14.5**
    - Test that invalid fields are highlighted and show validation messages
    - _Complexity: Medium_

  - [ ]* 11.5 Write unit tests for DeliveryModal
    - Test modal open/close
    - Test form field rendering
    - Test validation logic
    - Test form submission
    - _Complexity: Complex_

- [ ] 12. Implement delivery marking functionality
  - [ ] 12.1 Connect DeliveryModal to mark-delivered API
    - Implement handleSubmit function in modal
    - Call POST /api/delivery/mark-delivered with form data
    - Handle loading state during submission
    - Handle success response: close modal, refresh orders, show notification
    - Handle error response: display error message, keep modal open
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7, 14.1, 14.2_
    - _Complexity: Medium_

  - [ ] 12.2 Implement UI updates after delivery marking
    - Remove order from Ready tab after successful marking
    - Add order to Delivered tab after successful marking
    - Update statistics cards
    - Refresh both tabs to reflect changes
    - _Requirements: 6.4, 6.5_
    - _Complexity: Medium_

  - [ ]* 12.3 Write property test for UI update - removal from ready
    - **Property 21: UI Update After Delivery - Removal from Ready**
    - **Validates: Requirements 6.4**
    - Test that order is removed from Ready section after marking
    - _Complexity: Medium_

  - [ ]* 12.4 Write property test for UI update - addition to delivered
    - **Property 22: UI Update After Delivery - Addition to Delivered**
    - **Validates: Requirements 6.5**
    - Test that order appears in Delivered section after marking
    - _Complexity: Medium_

  - [ ]* 12.5 Write property test for success notification
    - **Property 23: Success Notification Display**
    - **Validates: Requirements 6.6, 14.1**
    - Test that success notification is displayed after successful marking
    - _Complexity: Simple_

  - [ ]* 12.6 Write property test for error handling
    - **Property 24: Error Handling on Failed Update**
    - **Validates: Requirements 6.7, 14.2**
    - Test that error is displayed and order remains Ready on failure
    - _Complexity: Medium_

- [ ] 13. Checkpoint - Ensure delivery marking flow works end-to-end
  - Test complete flow: open modal, fill form, submit, verify updates
  - Ensure all tests pass, ask the user if questions arise

- [ ] 14. Implement receipt generation functionality
  - [ ] 14.1 Create receipt generator utility at `/src/lib/receiptGenerator.js`
    - Create function to generate HTML receipt template
    - Include order information: orderId, customerName, customerPhone, orderDate, deliveryDate
    - Include payment breakdown: totalAmount, firstAdvance (amount + method), secondAdvance, remainingDue
    - Include delivery details: deliveredBy, deliveryPersonName, deliveryPersonMobile, deliveryNotes
    - Apply professional styling matching existing receipt style
    - Include application branding and contact information
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.8_
    - _Complexity: Medium_

  - [ ] 14.2 Implement receipt download functionality
    - Add "Generate Receipt" button to delivered order cards
    - Create handleGenerateReceipt function
    - Generate HTML using receiptGenerator utility
    - Create Blob from HTML
    - Trigger download with filename format: "Order-Receipt-{displayOrderId}.html"
    - _Requirements: 8.1, 8.7_
    - _Complexity: Simple_

  - [ ]* 14.3 Write property test for receipt button visibility
    - **Property 27: Generate Receipt Button Visibility**
    - **Validates: Requirements 8.1**
    - Test that Generate Receipt button is present for all delivered orders
    - _Complexity: Simple_

  - [ ]* 14.4 Write property test for receipt content completeness
    - **Property 28: Receipt Content Completeness**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**
    - Test that generated receipt contains all required fields
    - _Complexity: Medium_

  - [ ]* 14.5 Write property test for receipt download
    - **Property 29: Receipt Download Functionality**
    - **Validates: Requirements 8.7**
    - Test that clicking Generate Receipt triggers download with correct filename
    - _Complexity: Medium_

  - [ ]* 14.6 Write unit tests for receipt generation
    - Test HTML generation with various order data
    - Test download trigger
    - Test filename format
    - _Complexity: Medium_

- [ ] 15. Implement loading states and error handling
  - [ ] 15.1 Add loading indicators
    - Show spinner while fetching ready orders
    - Show spinner while fetching delivered orders
    - Show loading state in modal during submission
    - Use consistent loading indicator styling
    - _Requirements: 11.6, 14.3, 15.1_
    - _Complexity: Simple_

  - [ ] 15.2 Implement error notifications
    - Create toast notification component for success/error messages
    - Display success notification after delivery marking (auto-dismiss after 3 seconds)
    - Display error notification for API failures (manual dismiss)
    - Display error notification for network errors
    - Apply consistent error styling
    - _Requirements: 11.7, 14.1, 14.2, 14.4, 14.6, 14.7_
    - _Complexity: Medium_

  - [ ]* 15.3 Write property test for loading indicator display
    - **Property 31: Loading Indicator Display**
    - **Validates: Requirements 11.6, 14.3**
    - Test that loading indicator is visible during data loading
    - _Complexity: Simple_

  - [ ]* 15.4 Write property test for error message display
    - **Property 32: Error Message Display**
    - **Validates: Requirements 11.7, 14.4**
    - Test that error messages are displayed with consistent styling
    - _Complexity: Simple_

  - [ ]* 15.5 Write property test for success notification auto-dismiss
    - **Property 34: Success Notification Auto-Dismiss**
    - **Validates: Requirements 14.6**
    - Test that success notifications dismiss after 3 seconds
    - _Complexity: Simple_

  - [ ]* 15.6 Write property test for error notification persistence
    - **Property 35: Error Notification Persistence**
    - **Validates: Requirements 14.7**
    - Test that error notifications remain until manually dismissed
    - _Complexity: Simple_

- [ ] 16. Implement responsive design for mobile devices
  - [ ] 16.1 Add mobile-responsive layout
    - Ensure Delivery page works on mobile screens
    - Stack statistics cards vertically on mobile
    - Make order cards responsive
    - Ensure DeliveryModal is fully visible on mobile
    - Make touch targets minimum 44x44 pixels
    - Test on various screen sizes
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
    - _Complexity: Medium_

  - [ ]* 16.2 Write unit tests for responsive behavior
    - Test mobile layout rendering
    - Test touch target sizes
    - Test modal visibility on mobile
    - _Complexity: Medium_

- [ ] 17. Implement pagination for order lists
  - [ ] 17.1 Add pagination controls
    - Implement pagination when order count exceeds 50
    - Add page navigation controls (previous, next, page numbers)
    - Display current page and total pages
    - Maintain pagination state separately for each tab
    - _Requirements: 15.2_
    - _Complexity: Medium_

  - [ ]* 17.2 Write property test for pagination trigger
    - **Property 36: Pagination Trigger**
    - **Validates: Requirements 15.2**
    - Test that pagination appears when order count > 50
    - _Complexity: Simple_

- [ ] 18. Verify cross-page status consistency
  - [ ]* 18.1 Write property test for cross-page consistency
    - **Property 25: Cross-Page Status Consistency**
    - **Validates: Requirements 7.1, 7.2**
    - Test that status updates on Delivery page reflect on Orders and Production pages
    - _Complexity: Complex_

  - [ ]* 18.2 Write property test for order-production referential integrity
    - **Property 26: Order-Production Referential Integrity**
    - **Validates: Requirements 7.4**
    - Test that production records reference correct order IDs
    - _Complexity: Medium_

- [ ] 19. Implement API authentication and authorization tests
  - [ ]* 19.1 Write property test for API authentication enforcement
    - **Property 40: API Authentication Enforcement**
    - **Validates: Requirements 13.7**
    - Test that all /api/delivery/* endpoints return 401 without valid token
    - _Complexity: Medium_

  - [ ]* 19.2 Write property test for API error response format - invalid data
    - **Property 41: API Error Response Format - Invalid Data**
    - **Validates: Requirements 13.5**
    - Test that invalid data returns 400 with descriptive error message
    - _Complexity: Simple_

  - [ ]* 19.3 Write property test for API error response format - server error
    - **Property 42: API Error Response Format - Server Error**
    - **Validates: Requirements 13.6**
    - Test that server errors return 500 with error message
    - _Complexity: Simple_

  - [ ]* 19.4 Write property test for API response structure consistency
    - **Property 43: API Response Structure Consistency**
    - **Validates: Requirements 13.8**
    - Test that all API responses follow consistent structure
    - _Complexity: Medium_

- [ ] 20. Implement authorization check for delivery page access
  - [ ]* 20.1 Write property test for delivery page authorization
    - **Property 1: Authorization for Delivery Page Access**
    - **Validates: Requirements 1.5**
    - Test that admin and staff can access /dashboard/delivery
    - _Complexity: Simple_

- [ ] 21. Final checkpoint - Run all tests and verify complete functionality
  - Run all unit tests and property tests
  - Verify all features work end-to-end
  - Test on different browsers and devices
  - Ensure all tests pass, ask the user if questions arise

- [ ] 22. Integration testing and final validation
  - [ ]* 22.1 Write integration test for complete delivery flow
    - Test full flow: fetch ready orders → mark as delivered → verify in delivered section → generate receipt
    - Verify status propagation across all pages
    - Test error recovery scenarios
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
    - _Complexity: Complex_

  - [ ]* 22.2 Write integration test for search and filter combinations
    - Test multiple filters applied simultaneously
    - Test filter persistence across tab switches
    - Test clear filters functionality
    - _Complexity: Medium_

  - [ ]* 22.3 Write integration test for concurrent operations
    - Test multiple users marking orders as delivered simultaneously
    - Test handling of already-delivered orders
    - _Complexity: Complex_

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- Implementation follows existing codebase patterns (Next.js App Router, React hooks, Tailwind CSS)
- Brown gradient theme (#975a20 to #7d4a1a) should be applied consistently
- All API endpoints require authentication (staff/admin roles)
- Database schema changes are backward compatible with existing orders
- Receipt generation uses HTML format matching existing receipt style
- Mobile responsiveness is critical for field usage
- Pagination improves performance for large order lists
- Error handling provides clear user feedback at all stages
