import { FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { downloadPdf, downloadTxt } from "@/lib/export";

interface Props {
  filename: string;
  title: string;
  text: string;
}

export function ExportButtons({ filename, title, text }: Props) {
  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => downloadTxt(filename, text)}>
            <FileText className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download .txt</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => downloadPdf(filename, title, text)}>
            <FileDown className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download .pdf</TooltipContent>
      </Tooltip>
    </div>
  );
}
