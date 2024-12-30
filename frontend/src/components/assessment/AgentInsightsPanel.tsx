import React from 'react';
import { useAssessmentAgent } from '../../contexts/AssessmentAgentContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, AlertTriangle, Info, Activity } from 'lucide-react';

const AgentInsightsPanel: React.FC = () => {
    const { analysis, insights } = useAssessmentAgent();

    if (!analysis) return null;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-500';
            case 'moderate':
                return 'text-amber-500';
            default:
                return 'text-blue-500';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'moderate':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Risk Factors Section */}
            {analysis.riskFactors.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Risk Factors Identified
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.riskFactors.map((risk, index) => (
                            <Alert key={index} variant={risk.severity === 'high' ? 'destructive' : 'default'}>
                                <div className="flex items-start gap-2">
                                    {getSeverityIcon(risk.severity)}
                                    <div>
                                        <AlertTitle className={getSeverityColor(risk.severity)}>
                                            {risk.type} Risk - {risk.severity.toUpperCase()}
                                        </AlertTitle>
                                        <AlertDescription>
                                            <p className="mt-1">{risk.details}</p>
                                            {risk.recommendations.length > 0 && (
                                                <ul className="mt-2 list-disc list-inside space-y-1">
                                                    {risk.recommendations.map((rec, idx) => (
                                                        <li key={idx}>{rec}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </AlertDescription>
                                    </div>
                                </div>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Functional Changes Section */}
            {analysis.functionalChanges.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Functional Changes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.functionalChanges.map((change, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                <h4 className="font-semibold capitalize">{change.type} Change</h4>
                                {change.activity && (
                                    <p className="text-sm text-gray-600">Activity: {change.activity}</p>
                                )}
                                {(change.preStatus && change.currentStatus) && (
                                    <p className="text-sm text-gray-600">
                                        Status Change: {change.preStatus} → {change.currentStatus}
                                    </p>
                                )}
                                <p className="mt-1">{change.details}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Recommendations Section */}
            {analysis.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Agent Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                                {getSeverityIcon(rec.priority)}
                                <div>
                                    <h4 className={`font-semibold ${getSeverityColor(rec.priority)}`}>
                                        {rec.type}
                                    </h4>
                                    <p className="mt-1">{rec.recommendation}</p>
                                    <p className="mt-1 text-sm text-gray-600">{rec.rationale}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AgentInsightsPanel;