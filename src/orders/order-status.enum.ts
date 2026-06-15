export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  READY_FOR_PICKUP = 'ready_for_pickup',
  ASSIGNED_TO_RIDER = 'assigned_to_rider',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
}