import React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
Storage Hook
*/

const usePersistedState = <T,>(key: string, defaultValue: T) => {
  const [state, setState] = React.useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedState = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          sessionStorage.setItem(key, JSON.stringify(newValue));
        } catch (e) {
          console.warn("Failed to save to storage:", e);
        }
        return newValue;
      });
    },
    [key],
  );

  const clearPersistedState = React.useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("Failed to clear storage:", e);
    }
    setState(defaultValue);
  }, [key, defaultValue]);

  return [state, setPersistedState, clearPersistedState] as const;
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

  const handleClear = () => {
    form.reset();
    // Give the form time to reset before clearing storage
    setTimeout(() => {
      clearPersistedValues();
    }, 0);
  };

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
              (state.values.vacancyRate / 100) *
              (state.values.rentalIncomeMonthly * 12)
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
        <FieldSeparator />
        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            const rentAnnual = values.rentalIncomeMonthly * 12;
            const lostToVanacy =
              (values.vacancyRate / 100) * (values.rentalIncomeMonthly * 12);
            const totalHomeValue =
              values.sellPrice + values.rennovationExpenses;
            const expenses =
              (values.annualExpensesPercent / 100) * totalHomeValue;
            const operatingIncome =
              rentAnnual -
              lostToVanacy -
              expenses -
              values.annualInsurance -
              values.annualTax;

            return (
              <div>
                <Table>
                  <TableCaption>
                    <p>
                      Net Capital Rate (NOI / SP):
                      <span className="font-bold text-primary">
                        {" "}
                        {formatNumber(
                          calculatePercent(operatingIncome, values.sellPrice),
                        )}
                        {"%"}
                      </span>
                    </p>
                    <p className="text-sm font-light">
                      The rate of return on the property
                    </p>
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Income / Expense</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Annual Rental Income</TableCell>
                      <TableCell className="text-green-500">
                        + ${formatNumber(rentAnnual)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Annual Tax</TableCell>
                      <TableCell className="text-red-500">
                        - ${formatNumber(values.annualTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Annual Expenses</TableCell>
                      <TableCell className="text-red-500">
                        - ${formatNumber(expenses)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lost to Vacancy</TableCell>
                      <TableCell className="text-red-500">
                        - ${formatNumber(lostToVanacy)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Insurance Payment</TableCell>
                      <TableCell className="text-red-500">
                        - ${formatNumber(values.annualInsurance)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>Net Operating Income (Annual)</TableCell>
                      <TableCell
                        className={
                          operatingIncome > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {operatingIncome > 0 ? "+ $" : "- $"}
                        {formatNumber(Math.abs(operatingIncome))}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            );
          }}
        </form.Subscribe>
      </FieldSet>
      <div className="flex gap-4 mt-8">
        <Button type="submit" className="text-white">
          Calculate
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear Form
        </Button>
      </div>
    </form>
  );
}
