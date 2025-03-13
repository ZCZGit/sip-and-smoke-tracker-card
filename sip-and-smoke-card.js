class SipAndSmokeCard extends HTMLElement {
    constructor() {
        super();
        this.devices = [];
    }

    set hass(hass) {
        this._hass = hass;

        if (!this.devices.length && this.consumableType) {
            this.fetchDevices();
        } else if (this.content) {
            const childCards = this.content.querySelectorAll("hui-element, *");
            childCards.forEach((childCard) => {
                if (childCard && typeof childCard.hass !== "undefined") {
                    childCard.hass = hass;
                }
            });
        }
    }

    connectedCallback() {
        super.connectedCallback?.();

        this.addEventListener("state-update", (event) => {
            const { selectedDevice, amount } = event.detail;
            this.updaterState = { selectedDevice, amount }; // Cache state
            console.log("Updater state cached:", this.updaterState);
        });

        this.addEventListener("amount-updated", async () => {
            console.log("Entity updated. Refreshing master card...");
            await this.fetchDevices();
            this.renderCard(); // Master card refresh
        });
    }


    refreshCard() {
        console.log("Refreshing the master card...");
        this.renderCard(); // Trigger a full re-render of the card
    }



    generateStatistics() {
        let statsHtml = "";

        if (this.consumableType.toLowerCase() === "whisky") {
            // Aggregate statistics for whisky
            const aggregatedData = {
                alcoholTypeCounts: {},
                countryCounts: {},
                distilleryCounts: {},
                regionCounts: {}
            };

            try {
                this.devices.forEach((deviceName) => {
                    const getEntity = (suffix) =>
                        Object.entries(this._hass.states).find(([_, entity]) =>
                            entity.attributes?.friendly_name === `${deviceName} ${suffix}`
                        );

                    const processEntity = (entityData, countObj) => {
                        if (entityData) {
                            const [_, entity] = entityData;
                            const value = entity.state || "Unknown";
                            countObj[value] = (countObj[value] || 0) + 1;
                        }
                    };

                    processEntity(getEntity("Alcohol Type"), aggregatedData.alcoholTypeCounts);
                    processEntity(getEntity("Country Of Origin"), aggregatedData.countryCounts);
                    processEntity(getEntity("Distillery"), aggregatedData.distilleryCounts);
                    processEntity(getEntity("Region"), aggregatedData.regionCounts);
                });

                aggregatedData.mostPopularAlcoholType = Object.keys(aggregatedData.alcoholTypeCounts).reduce(
                    (a, b) => (aggregatedData.alcoholTypeCounts[a] > aggregatedData.alcoholTypeCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularCountry = Object.keys(aggregatedData.countryCounts).reduce(
                    (a, b) => (aggregatedData.countryCounts[a] > aggregatedData.countryCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularDistillery = Object.keys(aggregatedData.distilleryCounts).reduce(
                    (a, b) => (aggregatedData.distilleryCounts[a] > aggregatedData.distilleryCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularRegion = Object.keys(aggregatedData.regionCounts).reduce(
                    (a, b) => (aggregatedData.regionCounts[a] > aggregatedData.regionCounts[b] ? a : b),
                    null
                );

                statsHtml = `
                    Most Popular Alcohol Type: ${
                        aggregatedData.mostPopularAlcoholType || "Unknown"
                    } (${aggregatedData.alcoholTypeCounts[aggregatedData.mostPopularAlcoholType] || 0})<br>
                    Most Popular Country: ${
                        aggregatedData.mostPopularCountry || "Unknown"
                    } (${aggregatedData.countryCounts[aggregatedData.mostPopularCountry] || 0})<br>
                    Most Popular Distillery: ${
                        aggregatedData.mostPopularDistillery || "Unknown"
                    } (${aggregatedData.distilleryCounts[aggregatedData.mostPopularDistillery] || 0})<br>
                    Most Popular Region: ${
                        aggregatedData.mostPopularRegion || "Unknown"
                    } (${aggregatedData.regionCounts[aggregatedData.mostPopularRegion] || 0})
                `;
            } catch (error) {
                console.error("Error generating statistics for whisky:", error);
                statsHtml = "Statistics unavailable.";
            }
        } else if (this.consumableType.toLowerCase() === "wine") {
            // Aggregate statistics for wine
            const aggregatedData = {
                typeCounts: {},
                grapesCounts: {},
                countryCounts: {},
                regionCounts: {}
            };

            try {
                this.devices.forEach((deviceName) => {
                    const getEntity = (suffix) =>
                        Object.entries(this._hass.states).find(([_, entity]) =>
                            entity.attributes?.friendly_name === `${deviceName} ${suffix}`
                        );

                    const processEntity = (entityData, countObj) => {
                        if (entityData) {
                            const [_, entity] = entityData;
                            const value = entity.state || "Unknown";
                            countObj[value] = (countObj[value] || 0) + 1;
                        }
                    };

                    processEntity(getEntity("Type"), aggregatedData.typeCounts);
                    processEntity(getEntity("Grapes"), aggregatedData.grapesCounts);
                    processEntity(getEntity("Country Of Origin"), aggregatedData.countryCounts);
                    processEntity(getEntity("Region"), aggregatedData.regionCounts);
                });

                aggregatedData.mostPopularType = Object.keys(aggregatedData.typeCounts).reduce(
                    (a, b) => (aggregatedData.typeCounts[a] > aggregatedData.typeCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularGrapes = Object.keys(aggregatedData.grapesCounts).reduce(
                    (a, b) => (aggregatedData.grapesCounts[a] > aggregatedData.grapesCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularCountry = Object.keys(aggregatedData.countryCounts).reduce(
                    (a, b) => (aggregatedData.countryCounts[a] > aggregatedData.countryCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularRegion = Object.keys(aggregatedData.regionCounts).reduce(
                    (a, b) => (aggregatedData.regionCounts[a] > aggregatedData.regionCounts[b] ? a : b),
                    null
                );

                statsHtml = `
                    Most Popular Type: ${
                        aggregatedData.mostPopularType || "Unknown"
                    } (${aggregatedData.typeCounts[aggregatedData.mostPopularType] || 0})<br>
                    Most Popular Grapes: ${
                        aggregatedData.mostPopularGrapes || "Unknown"
                    } (${aggregatedData.grapesCounts[aggregatedData.mostPopularGrapes] || 0})<br>
                    Most Popular Country: ${
                        aggregatedData.mostPopularCountry || "Unknown"
                    } (${aggregatedData.countryCounts[aggregatedData.mostPopularCountry] || 0})<br>
                    Most Popular Region: ${
                        aggregatedData.mostPopularRegion || "Unknown"
                    } (${aggregatedData.regionCounts[aggregatedData.mostPopularRegion] || 0})
                `;
            } catch (error) {
                console.error("Error generating statistics for wine:", error);
                statsHtml = "Statistics unavailable.";
            }
        } else if (this.consumableType.toLowerCase() === "rum") {
            // Aggregate statistics for rum
            const aggregatedData = {
                typeCounts: {},
                countryCounts: {}
            };

            try {
                this.devices.forEach((deviceName) => {
                    const getEntity = (suffix) =>
                        Object.entries(this._hass.states).find(([_, entity]) =>
                            entity.attributes?.friendly_name === `${deviceName} ${suffix}`
                        );

                    const processEntity = (entityData, countObj) => {
                        if (entityData) {
                            const [_, entity] = entityData;
                            const value = entity.state || "Unknown";
                            countObj[value] = (countObj[value] || 0) + 1;
                        }
                    };

                    processEntity(getEntity("Type"), aggregatedData.typeCounts);
                    processEntity(getEntity("Country Of Origin"), aggregatedData.countryCounts);
                });

                aggregatedData.mostPopularType = Object.keys(aggregatedData.typeCounts).reduce(
                    (a, b) => (aggregatedData.typeCounts[a] > aggregatedData.typeCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularCountry = Object.keys(aggregatedData.countryCounts).reduce(
                    (a, b) => (aggregatedData.countryCounts[a] > aggregatedData.countryCounts[b] ? a : b),
                    null
                );

                statsHtml = `
                    Most Popular Type: ${
                        aggregatedData.mostPopularType || "Unknown"
                    } (${aggregatedData.typeCounts[aggregatedData.mostPopularType] || 0})<br>
                    Most Popular Country: ${
                        aggregatedData.mostPopularCountry || "Unknown"
                    } (${aggregatedData.countryCounts[aggregatedData.mostPopularCountry] || 0})
                `;
            } catch (error) {
                console.error("Error generating statistics for rum:", error);
                statsHtml = "Statistics unavailable.";
            }
        } else if (this.consumableType.toLowerCase() === "cigar") {
            // Aggregate statistics for cigars
            const aggregatedData = {
                vitolaCounts: {},
                countryCounts: {},
                strengthCounts: {},
                ringGaugeCounts: {}
            };

            try {
                this.devices.forEach((deviceName) => {
                    const getEntity = (suffix) =>
                        Object.entries(this._hass.states).find(([_, entity]) =>
                            entity.attributes?.friendly_name === `${deviceName} ${suffix}`
                        );

                    const processEntity = (entityData, countObj) => {
                        if (entityData) {
                            const [_, entity] = entityData;
                            const value = entity.state || "Unknown";
                            countObj[value] = (countObj[value] || 0) + 1;
                        }
                    };

                    processEntity(getEntity("Vitola"), aggregatedData.vitolaCounts);
                    processEntity(getEntity("Origin"), aggregatedData.countryCounts);
                    processEntity(getEntity("Strength"), aggregatedData.strengthCounts);
                    processEntity(getEntity("Ring Gauge"), aggregatedData.ringGaugeCounts);
                });

                aggregatedData.mostPopularVitola = Object.keys(aggregatedData.vitolaCounts).reduce(
                    (a, b) => (aggregatedData.vitolaCounts[a] > aggregatedData.vitolaCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularCountry = Object.keys(aggregatedData.countryCounts).reduce(
                    (a, b) => (aggregatedData.countryCounts[a] > aggregatedData.countryCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularStrength = Object.keys(aggregatedData.strengthCounts).reduce(
                    (a, b) => (aggregatedData.strengthCounts[a] > aggregatedData.strengthCounts[b] ? a : b),
                    null
                );

                aggregatedData.mostPopularRingGauge = Object.keys(aggregatedData.ringGaugeCounts).reduce(
                    (a, b) => (aggregatedData.ringGaugeCounts[a] > aggregatedData.ringGaugeCounts[b] ? a : b),
                    null
                );

                statsHtml = `
                    Most Popular Vitola: ${
                        aggregatedData.mostPopularVitola || "Unknown"
                    } (${aggregatedData.vitolaCounts[aggregatedData.mostPopularVitola] || 0})<br>
                    Most Popular Country: ${
                        aggregatedData.mostPopularCountry || "Unknown"
                    } (${aggregatedData.countryCounts[aggregatedData.mostPopularCountry] || 0})<br>
                    Most Popular Strength: ${
                        aggregatedData.mostPopularStrength || "Unknown"
                    } (${aggregatedData.strengthCounts[aggregatedData.mostPopularStrength] || 0})<br>
                    Most Popular Ring Gauge: ${
                        aggregatedData.mostPopularRingGauge || "Unknown"
                    } (${aggregatedData.ringGaugeCounts[aggregatedData.mostPopularRingGauge] || 0})
                `;
            } catch (error) {
                console.error("Error generating statistics for cigar:", error);
                statsHtml = "Statistics unavailable.";
            }
        } else {
            statsHtml = "Invalid consumable type.";
        }
        return statsHtml;
    }

    // New code to create featured card
    createFeaturedCard(config) {
        const featured = document.createElement('div');
        featured.style.display = 'flex';
        featured.style.alignItems = 'center'; // Align items within the container
        featured.style.justifyContent = 'space-between'; // Space out text and image
        featured.style.marginBottom = '0px';
        featured.style.marginTop = '8px';
        featured.style.background = 'transparent'; // Transparent background
        featured.style.border = 'none'; // Subtle border for structure

        // Add the text container
        const textContainer = document.createElement('div');
        textContainer.style.flex = '1'; // Take up remaining space
        textContainer.style.display = 'flex';
        textContainer.style.flexDirection = 'column'; // Stack text vertically

        // Append the title to the text container
        const title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.fontSize = '1.0em';
        title.style.margin = '0';
        title.innerText = `Featured: ${config.device_friendly_name}`;
        textContainer.appendChild(title); // Add the title to the text container

        // Append the details below the title
        const details = document.createElement('div');
        details.style.fontSize = '0.9em';
        details.style.color = 'gray';
        details.style.marginTop = '4px'; // Add spacing between title and details

        // Dynamically set the description based on `is_open` or `is_new`
        if (config.is_open) {
            details.innerText = `Bottle is open, dive in!`; // Text for is_open = true
        } else if (config.is_new) {
            details.innerText = `Recently added!`; // Text for is_new = true
        }
        textContainer.appendChild(details); // Add the details to the text container

        // Append the text container to the featured container
        featured.appendChild(textContainer);

        // Add the image on the right, if available
        if (config.image) {
            const imageContainer = document.createElement('div');
            imageContainer.style.flexShrink = '0'; // Prevent shrinking of the image
            imageContainer.style.marginLeft = '16px'; // Space between text and image

            const featuredImage = document.createElement('img');
            featuredImage.src = config.image;
            featuredImage.style.width = '70px';
            featuredImage.style.height = '70px';
            featuredImage.style.borderRadius = '8px'; // Rounded corners
            featuredImage.style.objectFit = 'cover'; // Ensure image scales nicely
            imageContainer.appendChild(featuredImage);

            featured.appendChild(imageContainer);
        }

        return featured;
    }

    saveToggleState(card) {
        const content = card.querySelector('.content');
        this.toggleState = content.style.display === 'block' ? 'expanded' : 'collapsed';
    }

    restoreToggleState(card) {
        const content = card.querySelector('.content');
        const icon = card.querySelector('ha-icon');
        const isExpanded = this.toggleState === 'expanded';

        content.style.display = isExpanded ? 'block' : 'none';
        icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    }


    async fetchDevices() {
        const sanitizeDeviceName = (name) =>
            name.toLowerCase().replace(/[\W_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

        try {
            const devices = await this._hass.connection.sendMessagePromise({
                type: "config/device_registry/list",
            });

            console.log("All fetched devices:", devices);

            const sipAndSmokeDevices = devices.filter((device) =>
                (device.manufacturer === "Sip and Smoke Tracker" ||
                    device.config_entries.some((entry) => entry === "sip_and_smoke_tracker")) &&
                device.model.toLowerCase() === this.consumableType.toLowerCase()
            );

            console.log("Filtered Sip and Smoke devices:", sipAndSmokeDevices);

            const filteredDevices = sipAndSmokeDevices.filter((device) => {
                const sanitizedDeviceName = sanitizeDeviceName(device.name);
                const entityId = `sensor.${sanitizedDeviceName}_amount`;
                const amountEntity = this._hass.states[entityId];

                const amount = amountEntity ? parseInt(amountEntity.state, 10) : 0;
                console.log(`Device: ${device.name}, Amount: ${amount}`);

                return amount >= 1;
            });

            console.log("Final filtered devices with Amount > 1:", filteredDevices);

            this.devices = filteredDevices.map((device) => device.name || `Device ID: ${device.id}`);

            this.refreshCard(); // Refresh the card after updating devices
        } catch (error) {
            console.error("Error fetching devices:", error);

            const card = document.createElement("ha-card");
            const cardContent = document.createElement("div");
            cardContent.className = "card-content";
            cardContent.innerText = "An error occurred while fetching devices. Please check the logs for details.";
            card.appendChild(cardContent);
            this.innerHTML = "";
            this.appendChild(card);
        }
    }


    async determineFeaturedCard() {
        try {
            // Fetch all devices from the registry
            const devices = await this._hass.connection.sendMessagePromise({
                type: "config/device_registry/list",
            });

            console.log("All fetched devices:", devices);

            // Step 1: Filter devices belonging specifically to "Sip and Smoke Tracker"
            const sipAndSmokeDevices = devices.filter((device) =>
                (device.manufacturer === "Sip and Smoke Tracker" ||
                    device.config_entries.some((entry) => entry === "sip_and_smoke_tracker")) &&
                device.model.toLowerCase() === this.consumableType.toLowerCase()
            );

            console.log("Filtered Sip and Smoke devices:", sipAndSmokeDevices);

            // Step 2: Find the device with the most recent Entry Date
            let mostRecentDevice = null;
            let mostRecentDate = null;

            sipAndSmokeDevices.forEach((device) => {
                const deviceName = device.name;
                if (deviceName) {
                    // Construct the Entry Date entity ID dynamically
                    const entryDateEntityId = `sensor.${deviceName.toLowerCase().replace(/\s+/g, "_")}_entry_date`;
                    const entryDateEntity = this._hass.states[entryDateEntityId];

                    if (entryDateEntity) {
                        const entryDate = new Date(entryDateEntity.state);
                        if (!mostRecentDate || entryDate > mostRecentDate) {
                            mostRecentDate = entryDate;
                            mostRecentDevice = device;
                        }
                    } else {
                        console.warn(`Entry Date entity not found for device: ${deviceName}`);
                    }
                }
            });

            console.log("Most recent device based on Entry Date:", mostRecentDevice);

            // Auto-populate the featured card
            if (mostRecentDevice) {
                return {
                    device_friendly_name: mostRecentDevice.name,
                    is_new: true, // Mark as newly added
                };
            } else {
                console.warn("No valid Entry Date found to determine a featured card.");
                return null; // No auto-featured card
            }
        } catch (error) {
            console.error("Error determining the featured card:", error);
            return null;
        }
    }


    async renderCard() {
        // Get the count of devices
        const deviceCount = this.devices.length;
        console.log(`Rendering card. Number of devices: ${deviceCount}`);

        // Save the current toggle state (open or closed)
        const currentCard = this.querySelector('ha-card');
        const currentContent = currentCard?.querySelector('.content');
        const isExpanded = currentContent && currentContent.style.display === 'block';

        // Create the main card element
        const card = document.createElement('ha-card');

        // Create the header section
        const header = document.createElement('div');
        header.className = 'header';
        header.style.cssText = 'display: flex; align-items: center; padding: 16px; border-bottom: 1px solid var(--divider-color);';

        // Add an image to the header, if provided
        if (this.imageUrl) {
            const img = document.createElement('img');
            img.src = this.imageUrl;
            img.style.cssText = 'width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 16px;';
            header.appendChild(img);
        }

        // Header content container
        const headerContent = document.createElement('div');
        headerContent.style.flexGrow = '1';

        // Title for the card
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; font-size: 1.2em;';
        title.innerText = `${this.cardTitle || "Sip and Smoke"} (${deviceCount})`;
        headerContent.appendChild(title);

        // Add the featured card below the title
        let featuredCardConfig = null;

        if (this.config.featured_card) {
            console.log(`Manual featured card specified: ${this.config.featured_card}`);
            featuredCardConfig = {
                device_friendly_name: this.config.featured_card,
                is_open: this.config.is_open || false,
                is_new: this.config.is_new || false,
            };
            const imagePathEntityId = `sensor.${this.config.featured_card.toLowerCase().replace(/\s+/g, "_")}_image_path`;
            console.log(`Image path entity ID for manual featured card: ${imagePathEntityId}`);
            const imagePathEntity = this._hass.states[imagePathEntityId];
            if (imagePathEntity) {
                featuredCardConfig.image = imagePathEntity.state || '/local/default-flower.jpg';
            } else {
                console.warn(`Image path entity not found for manual featured card: ${this.config.featured_card}`);
            }
        } else if (this.devices && this.devices.length > 0) {
            console.log("No manual featured card specified. Determining auto-featured card.");
            let mostRecentDevice = null;
            let mostRecentDate = null;

            for (const deviceName of this.devices) {
                const sanitizeDeviceName = (name) =>
                    name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

                const sanitizedDeviceName = sanitizeDeviceName(deviceName);
                const entryDateEntityId = `sensor.${sanitizedDeviceName}_entry_date`;

                const entryDateEntity = this._hass.states[entryDateEntityId];
                if (entryDateEntity) {
                    const entryDate = new Date(entryDateEntity.state);
                    console.log(`Entry Date for '${deviceName}': ${entryDate}`);
                    if (!mostRecentDate || entryDate > mostRecentDate) {
                        mostRecentDate = entryDate;
                        mostRecentDevice = deviceName;
                    }
                } else {
                    console.warn(`Entry Date entity not found for device: ${deviceName}`);
                }
            }

            if (mostRecentDevice) {
                const sanitizeDeviceName = (name) =>
                    name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

                const sanitizedDeviceName = sanitizeDeviceName(mostRecentDevice);

                console.log(`Most recent device determined: ${mostRecentDevice}`);
                const imagePathEntityId = `sensor.${sanitizedDeviceName}_image_path`;
                console.log(`Sanitized Image Path entity ID for auto-featured card: ${imagePathEntityId}`);

                const imagePathEntity = this._hass.states[imagePathEntityId];
                featuredCardConfig = {
                    device_friendly_name: mostRecentDevice,
                    is_new: true,
                    image: imagePathEntity ? imagePathEntity.state : '/local/default-image.jpg',
                };
            } else {
                console.warn("No valid auto-featured device found.");
            }
        }


        console.log("Final featured card configuration:", featuredCardConfig);

        if (featuredCardConfig) {
            const featuredCard = this.createFeaturedCard(featuredCardConfig);
            console.log("Featured card created:", featuredCard);
            if (featuredCard) {
                headerContent.appendChild(featuredCard);
            } else {
                console.warn("Failed to create featured card for:", featuredCardConfig);
            }
        }

        // Add the statistics section below the featured card
        const stats = document.createElement('div');
        stats.className = 'statistics';
        stats.style.cssText = 'margin-top: 8px; font-size: 0.9em; color: gray;';

        const statsTitle = document.createElement('div');
        statsTitle.className = 'stats-title';
        statsTitle.style.cssText = 'font-weight: bold; font-size: 1.1em; margin-bottom: 8px; color: var(--primary-text-color);';
        statsTitle.innerText = `${this.cardTitle || "Sip and Smoke"} Stats`;
        stats.appendChild(statsTitle);

        stats.innerHTML += this.generateStatistics();
        headerContent.appendChild(stats);

        // Append header content to the header
        header.appendChild(headerContent);

        // Add a toggle icon for expanding/collapsing
        const icon = document.createElement('ha-icon');
        icon.icon = 'mdi:chevron-down';
        icon.style.cssText = 'cursor: pointer; transition: transform 0.3s;';
        icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        icon.addEventListener('click', () => {
            const content = card.querySelector('.content');
            const isCurrentlyExpanded = content.style.display === 'block';
            content.style.display = isCurrentlyExpanded ? 'none' : 'block';
            icon.style.transform = isCurrentlyExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });
        header.appendChild(icon);

        // Append the header to the card
        card.appendChild(header);

        // Create the content section
        const content = document.createElement('div');
        content.className = 'content';
        content.style.cssText = isExpanded ? 'display: block; padding: 16px;' : 'display: none; padding: 16px;';

        // Add a container for nested cards
        const nestedCards = document.createElement('div');
        nestedCards.className = 'nested-cards';
        content.appendChild(nestedCards);

        // Append the content section to the card
        card.appendChild(content);

        // Clear the previous content and append the new card
        this.innerHTML = '';
        this.appendChild(card);

        // Render the nested cards
        await this.renderNestedCards(nestedCards);
    }


    async renderNestedCards(container) {
        for (const deviceName of this.devices) {
            // Use the sanitizeDeviceName function to ensure consistency in entity naming
            const sanitizeDeviceName = (name) =>
                name.toLowerCase().replace(/[\W_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

            const sanitizedDeviceName = sanitizeDeviceName(deviceName);

            // Dynamically construct the exclude_entities array
            const excludeEntities = [
                `sensor.${sanitizedDeviceName}_description`,
                `sensor.${sanitizedDeviceName}_image_path`,
                `sensor.${sanitizedDeviceName}_name`,
            ];

            // Check the existence of the description and image path entities
            const descriptionEntity =
                this._hass.states[`sensor.${sanitizedDeviceName}_description`] || {
                    state: "No description available",
                };
            const imagePathEntity =
                this._hass.states[`sensor.${sanitizedDeviceName}_image_path`] || {
                    state: "/local/default-image.jpg",
                };

            // Create the card configuration with description and image path included
            const cardConfig = {
                type: "custom:sip-and-smoke-tracker-consumables-card",
                device_friendly_name: deviceName,
                is_toggle: true,
                show_footer: true,
                exclude_entities: excludeEntities,
                description: descriptionEntity.state,
                image_path: imagePathEntity.state,
                ...(this.consumableType.toLowerCase() === "cigar"
                    ? { card_type: "cigar", humidity_sensor: this.config.humidity_sensor }
                    : {}),
            };

            // Create the card element
            const cardElement = await this._createCardElement(cardConfig);
            if (cardElement) {
                // Wrap each card in a div with 6px padding
                const cardContainer = document.createElement('div');
                cardContainer.style.marginBottom = '6px'; // Add 6px padding below each card
                cardContainer.appendChild(cardElement);
                container.appendChild(cardContainer);
            }
        }

        // Check if `include_updater` is set to true in the master card's YAML configuration
        if (this.config.include_updater) {
            // Embed the custom:sip-and-smoke-amount-changer card as the last card
            const amountChangerConfig = {
                type: "custom:sip-and-smoke-amount-changer",
                title: "Inventory Updater",
                consumable_type: this.consumableType, // Use the consumable_type from the master card's YAML
            };

            const amountChangerElement = await this._createCardElement(amountChangerConfig);
            if (amountChangerElement) {
                // Wrap the Inventory Updater card in a div with 6px padding
                const updaterContainer = document.createElement('div');
                updaterContainer.style.marginBottom = '6px'; // Add 6px padding below the updater card
                updaterContainer.appendChild(amountChangerElement);
                container.appendChild(updaterContainer);
            }
        }
    }

    async _createCardElement(cardConfig) {
        try {
            const element = await loadCardHelpers().then((helpers) =>
                helpers.createCardElement(cardConfig)
            );
            element.hass = this._hass;
            return element;
        } catch (error) {
            console.error("Error creating card element:", cardConfig, error);
            return null;
        }
    }

    setConfig(config) {
        if (!config.consumable_type) {
            throw new Error(
                "You must define a 'consumable_type' (e.g., whisky, wine, coffee, rum, cigars) in the card configuration."
            );
        }

        this.cardTitle = config.title;
        this.consumableType = config.consumable_type;
        this.imageUrl = config.image; // Accept image URL from the configuration
        this.config = config;
        this.featuredDeviceName = config.featured_card;
        this.isOpen = config.is_open || false; // Save `is_open` property, default to false
        this.isNew = config.is_new || false; // Save `is_new` property, default to false
    }

    getCardSize() {
        return this.devices.length + 1;
    }
}

customElements.define("sip-and-smoke-card", SipAndSmokeCard);

