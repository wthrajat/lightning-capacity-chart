export interface NodeData {
    name: string;
    color: string;
    data: Array<{ date: string; value: number }>;
}

export interface GraphQLResponse {
    data?: {
        getNodeMetrics?: {
            historical_series?: string[][];
        };
    };
}
