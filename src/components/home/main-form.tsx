import React from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useForm, useStore } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

/*
Helper Functions
*/

const validateDecimalInput = (value: string): boolean => {
  return /^[\d,]*\.?\d{0,2}$/.test(value);
};

const formatNumber = (num: number) => {
  if (num !== 0 && !num) return "";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const parseNumber = (str: string) => {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const calculatePercent = (numerator: number, denominator: number): number => {
  if (numerator === 0 || denominator === 0) return 0;
  const percent = (numerator / denominator) * 100;
  return Math.round(percent * 100) / 100;
};

/*
Re-usable Components
*/

const CurrencyInput = ({ field, label, description }: any) => {
  const [inputValue, setInputValue] = React.useState<string | undefined>(
    undefined,
  );
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isFocused = inputValue !== undefined;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type="text"
          inputMode="decimal"
          value={isFocused ? inputValue : formatNumber(field.state.value)}
          onFocus={() => {
            setInputValue(String(field.state.value || ""));
          }}
          onBlur={() => {
            setInputValue(undefined);
            field.handleBlur();
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            if (validateDecimalInput(newValue)) {
              setInputValue(newValue);
              field.handleChange(parseNumber(newValue));
            }
          }}
          onPaste={(e) => {
            // Allow paste to work by preventing default validation momentarily
            const pastedText = e.clipboardData.getData("text");
            if (validateDecimalInput(pastedText)) {
              e.preventDefault();
              const parsed = parseNumber(pastedText);
              setInputValue(pastedText);
              field.handleChange(parsed);
            }
          }}
          aria-invalid={isInvalid}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

const PercentageInput = ({ field, label, description }: any) => {
  const [inputValue, setInputValue] = React.useState<string | undefined>(
    undefined,
  );
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isFocused = inputValue !== undefined;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>%</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type="text"
          inputMode="decimal"
          value={isFocused ? inputValue : formatNumber(field.state.value)}
          onFocus={() => {
            setInputValue(String(field.state.value || ""));
          }}
          onBlur={() => {
            setInputValue(undefined);
            field.handleBlur();
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            if (validateDecimalInput(newValue)) {
              const parsed = parseNumber(newValue);
              // Hard limit to 100
              if (parsed <= 100) {
                setInputValue(newValue);
                field.handleChange(parsed);
              }
            }
          }}
          aria-invalid={isInvalid}
        />
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
};

/*
Schema
*/

const formSchema = z.object({
  sellPrice: z.number().min(1),
  annualTax: z.number().min(1),
  rennovationExpenses: z.number(),
  rentalIncomeMonthly: z.number().min(1),
  vacancyRate: z.number(),
  annualExpensesPercent: z.number(),
  percentDown: z.number(),
  interestRate: z.number(),
  loanDurationYears: z.number(),
  annualAppreciationPercent: z.number(),
});

/*
Main form function
*/

export default function MainForm() {
  const form = useForm({
    defaultValues: {
      sellPrice: 0,
      annualTax: 0,
      rennovationExpenses: 0,
      rentalIncomeMonthly: 0,
      vacancyRate: 0,
      annualExpensesPercent: 0,
      percentDown: 0,
      interestRate: 0,
      loanDurationYears: 0,
      annualAppreciationPercent: 0,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // The actual HTML
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend>Property Details</FieldLegend>
        <FieldDescription>
          The baseline information so ROI can be calculated.
        </FieldDescription>
        <FieldGroup className="grid grid-cols-2 gap-4">
          <form.Field
            name="sellPrice"
            children={(field) => (
              <CurrencyInput
                field={field}
                label="Sale Price"
                description="How much was paid or expected to be paid for the property."
              />
            )}
          />
          <form.Field
            name="rennovationExpenses"
            children={(field) => (
              <CurrencyInput
                field={field}
                label="Rennovation Expenses"
                description="Money was spent on rennovations. This is simply combined with the sale price provide a more reliable estimate."
              />
            )}
          />
          <form.Field
            name="annualTax"
            children={(field) => (
              <CurrencyInput
                field={field}
                label="Annual Tax"
                description="The expected cost in taxes for the Property."
              />
            )}
          />
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
                      description="The projected % dedicated to maintaining the property every year."
                    />
                  )}
                </form.Field>
                <Label className="pt-2 text-primary text-xs">
                  {annualExpenses} based on sale price + rennovation expenses
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
                <form.Field
                  name="rentalIncomeMonthly"
                  children={(field) => (
                    <CurrencyInput
                      field={field}
                      label="Monthly Rental Income"
                      description="The projected rental income per month."
                    />
                  )}
                />
                <Label className="pt-2 text-primary text-xs">
                  ${rentalIncomeAnnually} annually
                </Label>
              </div>
            )}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) =>
              (state.values.vacancyRate / 100) *
              (state.values.rentalIncomeMonthly * 12)
            }
          >
            {(rentalIncomeAnnually) => (
              <div>
                <form.Field
                  name="vacancyRate"
                  children={(field) => (
                    <PercentageInput
                      field={field}
                      label="Vacancy Rate"
                      description="The projected vacancy rate of the property."
                    />
                  )}
                />
                <Label className="pt-2 text-primary text-xs">
                  ${formatNumber(rentalIncomeAnnually)} lost in revnue annually
                </Label>
              </div>
            )}
          </form.Subscribe>
        </FieldGroup>
      </FieldSet>
      <Button type="submit" className="text-white mt-8">
        Calculate
      </Button>
    </form>
  );
}
