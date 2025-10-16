import React from "react";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePersistedState } from "@/lib/persistedState";
import { calculatePercent, formatNumber } from "@/lib/utils";
import PercentageInput from "@/components/percentageInput";
import CurrencyInput from "@/components/currencyInput";
import IncomeTable from "./incomeTable";
import DurationInput from "../durationInput";

/*
Schema
*/

const formSchema = z.object({
  sellPrice: z.number().min(1),
  annualTax: z.number().min(1),
  rennovationExpenses: z.number(),
  rentalIncomeMonthly: z.number().min(1),
  vacancyRate: z.number(),
  annualInsurance: z.number(),
  annualExpensesPercent: z.number(),
  percentDown: z.number(),
  interestRate: z.number(),
  loanDurationYears: z.number(),
  annualAppreciationPercent: z.number(),
});

const DEFAULT_VALUES = {
  sellPrice: 0,
  annualTax: 0,
  rennovationExpenses: 0,
  rentalIncomeMonthly: 0,
  vacancyRate: 0,
  annualInsurance: 0,
  annualExpensesPercent: 0,
  percentDown: 0,
  interestRate: 0,
  loanDurationYears: 0,
  annualAppreciationPercent: 0,
};

/*
Main form function
*/

export default function MainForm() {
  const [persistedValues, setPersistedValues, clearPersistedValues] =
    usePersistedState("property-roi-form", DEFAULT_VALUES);

  const form = useForm({
    defaultValues: persistedValues,
    validators: {
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // Save to storage whenever form values change
  React.useEffect(() => {
    const subscription = form.store.subscribe(() => {
      const values = form.store.state.values;
      setPersistedValues(values);
    });
    return () => subscription();
  }, [form.store, setPersistedValues]);

  function handleClear() {
    form.reset();
    // Give the form time to reset before clearing storage
    setTimeout(() => {
      clearPersistedValues();
    }, 0);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend className="font-bold">Property Details</FieldLegend>
        <FieldDescription>
          The baseline information so ROI can be calculated.
        </FieldDescription>
        <FieldGroup className="grid grid-cols-2 gap-4">
          <form.Field name="sellPrice">
            {(field) => (
              <CurrencyInput
                field={field}
                label="Sale Price"
                description="How much was paid or expected to be paid for the property."
              />
            )}
          </form.Field>
          <form.Field name="rennovationExpenses">
            {(field) => (
              <CurrencyInput
                field={field}
                label="Rennovation Expenses"
                description="Money spent on rennovations. This is simply combined with the sale price provide a more reliable estimate."
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) =>
              calculatePercent(state.values.annualTax, state.values.sellPrice)
            }
          >
            {(percentOfSalePrice) => (
              <div>
                <form.Field name="annualTax">
                  {(field) => (
                    <CurrencyInput
                      field={field}
                      label="Annual Tax"
                      description="The cost in taxes for the Property."
                    />
                  )}
                </form.Field>
                <Label className="pt-2 text-primary text-sm">
                  {percentOfSalePrice}% based on sale price
                </Label>
              </div>
            )}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) => {
              const total =
                state.values.sellPrice + state.values.rennovationExpenses;
              return formatNumber(
                (state.values.annualExpensesPercent / 100) * total,
              );
            }}
          >
            {(annualExpenses) => (
              <div>
                <form.Field name="annualExpensesPercent">
                  {(field) => (
                    <PercentageInput
                      field={field}
                      label="Annual Expenses"
                      description="The % dedicated to maintaining the property every year."
                    />
                  )}
                </form.Field>
                <Label className="pt-2 text-primary text-sm">
                  ${annualExpenses} based on sale price + rennovation expenses
                </Label>
              </div>
            )}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) =>
              formatNumber(state.values.rentalIncomeMonthly * 12)
            }
          >
            {(rentalIncomeAnnually) => (
              <div>
                <form.Field name="rentalIncomeMonthly">
                  {(field) => (
                    <CurrencyInput
                      field={field}
                      label="Monthly Rental Income"
                      description="The rental income per month."
                    />
                  )}
                </form.Field>
                <Label className="pt-2 text-primary text-sm">
                  ${rentalIncomeAnnually} annually
                </Label>
              </div>
            )}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) =>
              calculatePercent(
                state.values.vacancyRate,
                state.values.rentalIncomeMonthly * 12,
              )
            }
          >
            {(rentalIncomeAnnually) => (
              <div>
                <form.Field name="vacancyRate">
                  {(field) => (
                    <PercentageInput
                      field={field}
                      label="Vacancy Rate"
                      description="The vacancy rate of the property."
                    />
                  )}
                </form.Field>
                <Label className="pt-2 text-primary text-sm">
                  ${formatNumber(rentalIncomeAnnually)} lost in revnue annually
                </Label>
              </div>
            )}
          </form.Subscribe>
          <form.Field name="annualInsurance">
            {(field) => (
              <CurrencyInput
                field={field}
                label="Annual Insurance Rate"
                description="The insurance rate per year."
              />
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet className="px-4 py-2 border-2 rounded-xl mt-6 border-yellow-600 border:ring-yellow-500">
        <FieldLegend className="bg-background px-1 text-yellow-600 dark:text-yellow-500 font-bold">
          In Cash Return
        </FieldLegend>
        <FieldDescription>
          How much is made annually if property is paid for in cash.
        </FieldDescription>
        <FieldGroup>
          <form.Subscribe selector={(state) => state.values}>
            {(values) => <IncomeTable values={values} />}
          </form.Subscribe>
        </FieldGroup>
      </FieldSet>
      <FieldSet className="mt-6">
        <FieldLegend className="font-bold">Financing Details</FieldLegend>
        <FieldDescription>
          Information required to calculate financing details.
        </FieldDescription>
        <FieldGroup className="grid grid-cols-2 gap-4">
          <form.Field name="percentDown">
            {(field) => (
              <PercentageInput
                field={field}
                label="Percent Down"
                description="The percentage of the property paid for in cash."
              />
            )}
          </form.Field>
          <form.Field name="interestRate">
            {(field) => (
              <PercentageInput
                field={field}
                label="Interest Rate"
                description="The interest rate on the loan."
              />
            )}
          </form.Field>
          <form.Field name="loanDurationYears">
            {(field) => (
              <DurationInput
                field={field}
                label="Loan Duration"
                description="The total duration of the loan in years."
              />
            )}
          </form.Field>
          <form.Field name="annualAppreciationPercent">
            {(field) => (
              <PercentageInput
                field={field}
                label="Annual Appreciation"
                description="The projected annual increase in the value of the property."
              />
            )}
          </form.Field>
        </FieldGroup>
        <FieldSeparator />
      </FieldSet>
      <div className="flex gap-4 mt-8">
        <Button type="submit" className="text-white">
          Calculate
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
