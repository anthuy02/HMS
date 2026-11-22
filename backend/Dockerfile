# Multi-stage Dockerfile for Spring Boot 3 Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy root pom, maven config and dependencies
COPY backend/.mvn ./.mvn
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy migration as single source of truth and source code
COPY db/migration ./db/migration
COPY backend/src ./src

# Build production jar
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache tzdata
ENV TZ=Asia/Ho_Chi_Minh
COPY --from=build /app/target/hotel-management-system-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
