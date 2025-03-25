import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface SummaryPreviewProps {
  summary: string;
  onAccept: () => void;
  onDiscard: () => void;
}

const SummaryPreview = ({
  summary,
  onAccept,
  onDiscard,
}: SummaryPreviewProps) => {
  return (
    <Card className="p-4 md:p-6 mt-4 bg-muted/30 border-2 border-dashed">
      <div className="space-y-4">
        <div className="prose">
          <p className="whitespace-pre-wrap">{summary}</p>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onDiscard}
          >
            <X className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onAccept}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SummaryPreview;
