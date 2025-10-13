"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Schema
const formSchema = z.object({
  // Property Details
  sellPrice: z.number().min(1),
  annualTax: z.number().min(1),
  rennovationExpenses: z.number(),
  rentalIncomeMonthly: z.number().min(1),
  vacancyRate: z.number().min(1),
  annualExpenses: z.number().min(1),
  // Financing details
  percentDown: z.number(),
  interestRate: z.number(),
  loanDurationYears: z.number(),
  // ROI details
  annualAppreciationPercent: z.number(),
});

// Format number with commas
const formatNumber = (num: number) => {
  if (!num && num !== 0) return "";
  return Number(num).toLocaleString("en-US");
};

// Parse formatted string to number
const parseNumber = (str: string) => {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, "");
  return Number(cleaned) || 0;
};

export default function MainForm() {
  const form = useForm({
    defaultValues: {
      sellPrice: 0,
      annualTax: 0,
      rennovationExpenses: 0,
      rentalIncomeMonthly: 0,
      vacancyRate: 0,
      annualExpenses: 0,
      percentDown: 0,
      interestRate: 0,
      loanDurationYears: 0,
      annualAppreciationPercent: 0,
    },
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

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
        <FieldGroup>
          <form.Field
            name="sellPrice"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Average Sale Price
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={formatNumber(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const parsed = parseNumber(e.target.value);
                      field.handleChange(parsed);
                    }}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Provide a concise title for your bug report.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          ></form.Field>
        </FieldGroup>
      </FieldSet>
      <Button type="submit" className="text-white mt-4">
        Calculate
      </Button>
    </form>
  );
}
