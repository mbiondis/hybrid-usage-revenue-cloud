// Final Version
export function onBeforeCalculate(quote, lines, conn) {
  if (lines) {
    lines.forEach((line) => {
      // Rate information is stored in the parent subscription
      var parent = line.parentItem;

      // Products that consume credit always have a parent subscription
      if (parent) {
        if (
          parent.record["UsageType__c"] == "Minimum Commitment" &&
          line.record["UsageType__c"] != null
        ) {
          var usagePeriodTerm =
            parent.record["CreditCarryoverType__c"] == "Pool"
              ? parent.record["UsageTerm__c"]
              : 1;
          line.record["IncludedUsageCredits__c"] =
            (parent.record["SBQQ__Quantity__c"] * usagePeriodTerm) /
            parent.record["SBQQ__DefaultSubscriptionTerm__c"];

          // Copy usage-specific attributes from parent
          line.record["UsageTerm__c"] = parent.record["UsageTerm__c"];
          line.record["CarryoverFactor__c"] =
            parent.record["CarryoverFactor__c"];
          line.record["CarryoverLimit__c"] = parent.record["CarryoverLimit__c"];
          line.record["OverageSurcharge__c"] =
            parent.record["OverageSurcharge__c"];
          line.record["CreditCarryoverType__c"] =
            parent.record["CreditCarryoverType__c"];
          line.record["CreditDistributionAmend__c"] =
            parent.record["CreditDistributionAmend__c"];

          // Update the Consumption Schedules
          if (line.consumptionSchedules) {
            line.consumptionSchedules.forEach((cs, index) => {
              const rates = cs.getRates();

              // Process the array
              const sortedArray = [];
              for (let i = 0, len = rates.length; i < len; i++) {
                console.log("Rate");
                console.table(rates[i]);

                // Filter out any unwanted currencies
                if (
                  rates[i].get("CurrencyIsoCode") ==
                  line.record["CurrencyIsoCode"]
                ) {
                  sortedArray.push([
                    rates[i].get("SBQQ__ProcessingOrder__c"),
                    i,
                  ]);
                }
              }

              // Tiers are not always sorted in ascending order,
              // so use a proxy array to sort the indexes and keep a reference to the tiers
              sortedArray.sort(sortFunction);
              function sortFunction(a, b) {
                if (a[0] === b[0]) {
                  return 0;
                } else {
                  return a[0] < b[0] ? -1 : 1;
                }
              }

              console.log("Sorted");
              console.table(sortedArray);

              // Loop through all the tiers
              for (
                let i = 0,
                  len = sortedArray.length,
                  lowerBound = 0,
                  upperBound = 1,
                  price = 0,
                  index = 0,
                  str = "";
                i < len;
                i++
              ) {
                // Base tier
                if (i == 0) {
                  lowerBound = 0;
                  upperBound = line.record["IncludedUsageCredits__c"] + 1;
                  price = 0;
                  console.log("Base Tier - Upper Bound = " + upperBound);
                } else {
                  // Current Lower Bound is always equal to the previous tier's Upper Bound
                  lowerBound = upperBound;

                  console.log("Overage Tier - Lower Bound = " + lowerBound);

                  // Overage tier
                  if (i == len - 1) {
                    // Go up the price waterfall to find the first non-zero price
                    price =
                      (parent.record["SBQQ__NetTotal__c"] ||
                        parent.record["SBQQ__RegularPrice__c"] ||
                        parent.record["SBQQ__CustomerPrice__c"] ||
                        parent.record["SBQQ__ListTotal__c"]) /
                      parent.record["SBQQ__ProrateMultiplier__c"];
                    console.log("Price befor Qty = " + price);

                    // Adjust for included usage credits
                    price /=
                      parent.record["SBQQ__Quantity__c"] -
                      (parent.record["SBQQ__Quantity__c"] >
                      parent.record["IncludedUsageCredits__c"]
                        ? parent.record["IncludedUsageCredits__c"]
                        : 0);
                    console.log(
                      "Qty = " +
                        (parent.record["SBQQ__Quantity__c"] -
                          (parent.record["SBQQ__Quantity__c"] >
                          parent.record["IncludedUsageCredits__c"]
                            ? parent.record["IncludedUsageCredits__c"]
                            : 0))
                    );

                    console.log("Net Price = " + price);
                    // Apply the overage surcharge
                    price *= 1 + parent.record["OverageSurcharge__c"] / 100;

                    upperBound = null;
                  }
                  // Intermediate tier
                  else {
                    // Fix this to apply the delta
                    price = 0;
                    upperBound = null;
                  }
                }

                // Use the index from the proxy array to edit the real tiers
                index = sortedArray[i][1];

                rates[index].set("SBQQ__LowerBound__c", lowerBound);
                rates[index].set("SBQQ__UpperBound__c", upperBound);
                rates[index].set("SBQQ__Price__c", price);
              }
            });
          }
        }
      }
    });
  }
  return Promise.resolve();
}
