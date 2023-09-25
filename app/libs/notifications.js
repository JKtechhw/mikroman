class notification {
    constructor(){}

    error(message, duration = 10, title = "Error") {
        const notification = this.#buildNotificationBox(message, title);
        notification.classList.add("error");

        this.#displayNotification(notification, duration);
    }

    info(message, duration = 10, title = "Info") {
        const notification = this.#buildNotificationBox(message, title);
        notification.classList.add("info");

        this.#displayNotification(notification, duration);
    }

    success(message, duration = 10, title= "Success") {
        const notification = this.#buildNotificationBox(message, title);
        notification.classList.add("success");

        this.#displayNotification(notification, duration);
    }

    warning(message, duration = 10, title = "Warning") {
        const notification = this.#buildNotificationBox(message, title);
        notification.classList.add("warn");

        this.#displayNotification(notification, duration);
    }

    #buildNotificationBox(message, title) {
        const notificationBox = document.createElement("div");
        notificationBox.classList.add("notification");

        const closeButton = document.createElement("button");
        closeButton.classList.add("close-button");
        notificationBox.appendChild(closeButton);

        const notificationContent = document.createElement("div");
        notificationContent.classList.add("notification-content");
        notificationBox.appendChild(notificationContent);

        const timeBox = document.createElement("div");
        timeBox.classList.add("time-box");
        notificationBox.appendChild(timeBox);

        const timeIndicator = document.createElement("div");
        timeIndicator.classList.add("time-indicator");
        timeBox.appendChild(timeIndicator);

        const notificationHeading = document.createElement("h5");
        notificationHeading.classList.add("notification-heading");
        notificationHeading.textContent = title;
        notificationContent.appendChild(notificationHeading);

        const notificationText = document.createElement("p");
        notificationText.classList.add("notification-text");
        notificationText.textContent = message;
        notificationContent.appendChild(notificationText);

        this.#setNotificationEvents(notificationBox);

        return notificationBox;
    }

    #setNotificationEvents(notificationBox) {
        notificationBox.addEventListener("mouseenter", () => {
            notificationBox.classList.add("paused");
        });

        notificationBox.addEventListener("mouseleave", () => {
            notificationBox.classList.remove("paused");
        });

        notificationBox.addEventListener("click", () => {
            notificationBox.classList.remove("paused");
        });

        const timeIndicator = notificationBox.querySelector(".time-indicator");
        timeIndicator.addEventListener("animationend", () => {
            this.#closeNotification(notificationBox);
        });

        notificationBox.addEventListener("click", () => {
            this.#closeNotification(notificationBox);
        });

        const closeButton = notificationBox.querySelector(".close-button");
        closeButton.addEventListener("click", () => {
            this.#closeNotification(notificationBox);
        });
    }

    #closeNotification(notificationBox) {
        notificationBox.addEventListener("transitionend", () => {
            notificationBox.remove();
        }, {once: true});

        notificationBox.classList.add("hidden");
    }

    #displayNotification(notificationElement, duration) {
        let notificationsBox = document.querySelector("#notifications-box");
        if(notificationsBox == null) {
            notificationsBox = document.createElement("div");
            notificationsBox.id = "notifications-box";
            document.body.insertAdjacentElement("afterbegin", notificationsBox);
        }

        const timeIndicator = notificationElement.querySelector(".time-indicator");
        timeIndicator.style.animationDuration = `${duration}s`;

        notificationElement.classList.add("hidden");
        notificationsBox.appendChild(notificationElement);
        notificationElement.classList.remove("hidden");
    }
}

module.exports = notification;