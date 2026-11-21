package com.team12.hms.domain.common;

public class DomainExceptions {
    public static class RoomNotAvailableException extends RuntimeException {
        public RoomNotAvailableException(String message) {
            super(message);
        }
    }

    public static class IllegalStateTransitionException extends RuntimeException {
        public IllegalStateTransitionException(String message) {
            super(message);
        }
    }

    public static class InvalidVoucherException extends RuntimeException {
        public InvalidVoucherException(String message) {
            super(message);
        }
    }

    public static class InsufficientDepositException extends RuntimeException {
        public InsufficientDepositException(String message) {
            super(message);
        }
    }
}
