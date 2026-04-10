import React from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeID } from "@/types";

interface BentoGridProps {
  lockChain: Record<NodeID, boolean>;
  currentNode: NodeID;
  dataLocker: any;
  getNodeTitle: (node: NodeID) => string;
}

export function BentoGrid({ lockChain, currentNode, dataLocker, getNodeTitle }: BentoGridProps) {
  return (
    <div className="bento-grid opacity-80">
      {Object.values(NodeID).map((node) => (
        lockChain[node] && node !== currentNode && (
          <motion.div 
            key={node}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none h-full">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {getNodeTitle(node)}
                </CardTitle>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs font-bold line-clamp-1">
                  {node === NodeID.NODE_1 ? dataLocker.node1?.role : 
                   node === NodeID.NODE_2 ? dataLocker.node2?.visual_dna?.texture :
                   node === NodeID.NODE_3 ? dataLocker.node3?.lighting :
                   node === NodeID.NODE_4 ? dataLocker.node4?.strategy : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      ))}
    </div>
  );
}
