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
import { calculatePercent, formatNumber } from "@/lib/utils";

interface IncomeTableProps {
  values: {
    sellPrice: number;
    rennovationExpenses: number;
    annualTax: number;
    rentalIncomeMonthly: number;
    vacancyRate: number;
    annualInsurance: number;
    annualExpensesPercent: number;
  };
}

export default function IncomeTable({ values }: IncomeTableProps) {
  const rentAnnual = values.rentalIncomeMonthly * 12;
  const lostToVacancy =
    (values.vacancyRate / 100) * (values.rentalIncomeMonthly * 12);
  const totalHomeValue = values.sellPrice + values.rennovationExpenses;
  const expenses = (values.annualExpensesPercent / 100) * totalHomeValue;
  const operatingIncome =
    rentAnnual -
    lostToVacancy -
    expenses -
    values.annualInsurance -
    values.annualTax;

  const capRate = calculatePercent(operatingIncome, values.sellPrice);

  return (
    <Table>
      <TableCaption>
        <p>
          Net Capital Rate (NOI / SP):{" "}
          <span className="font-bold text-yellow-600 dark:text-yellow-500">
            {formatNumber(capRate)}%
          </span>
        </p>
        <p className="text-sm font-light">The rate of return on the property</p>
      </TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead>Annual Income / Expenses</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell>Rental Income</TableCell>
          <TableCell className="text-green-500">
            + ${formatNumber(rentAnnual)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Tax</TableCell>
          <TableCell className="text-red-500">
            - ${formatNumber(values.annualTax)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Expenses</TableCell>
          <TableCell className="text-red-500">
            - ${formatNumber(expenses)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Lost to Vacancy</TableCell>
          <TableCell className="text-red-500">
            - ${formatNumber(lostToVacancy)}
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
          <TableCell>Net Operating Income</TableCell>
          <TableCell
            className={
              operatingIncome > 0
                ? "font-semibold text-green-500"
                : "font-semibold text-red-500"
            }
          >
            {operatingIncome > 0 ? "+ $" : "- $"}
            {formatNumber(Math.abs(operatingIncome))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
