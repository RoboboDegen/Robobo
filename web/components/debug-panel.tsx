import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { triggerEvent } from "@/lib/utils";
import { EVENT_COMMANDS, EventCommand, CommandParam } from "@/game/config/event-commands";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export default function DebugPanel() {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [paramValues, setParamValues] = useState<Record<string, Record<string, any>>>({});

    // 处理参数值变化
    const handleParamChange = (commandName: string, paramKey: string, value: any) => {
        setParamValues(prev => ({
            ...prev,
            [commandName]: {
                ...(prev[commandName] || {}),
                [paramKey]: value
            }
        }));
    };

    // 获取命令的当前参数值
    const getCommandParams = (command: EventCommand) => {
        const values = paramValues[command.name] || {};
        return Object.fromEntries(
            (command.params || []).map(param => [
                param.key,
                values[param.key] ?? param.default
            ])
        );
    };

    // 渲染参数输入控件
    const renderParamInput = (command: EventCommand, param: CommandParam) => {
        const value = paramValues[command.name]?.[param.key] ?? param.default ?? '';

        switch (param.type) {
            case 'select':
                return (
                    <Select
                        value={String(value)}
                        onValueChange={(newValue) => 
                            handleParamChange(command.name, param.key, newValue)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={param.name} />
                        </SelectTrigger>
                        <SelectContent>
                            {param.options?.map(option => (
                                <SelectItem 
                                    key={String(option.value)} 
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        placeholder={param.name}
                        value={value}
                        onChange={(e) => 
                            handleParamChange(command.name, param.key, Number(e.target.value))
                        }
                        className="w-full"
                    />
                );
            default:
                return (
                    <Input
                        type="text"
                        placeholder={param.name}
                        value={value}
                        onChange={(e) => 
                            handleParamChange(command.name, param.key, e.target.value)
                        }
                        className="w-full"
                    />
                );
        }
    };

    // 渲染单个命令卡片
    const renderCommandButton = (command: EventCommand) => (
        <Card key={`${command.category}-${command.name}`} className="mb-2">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">{command.name}</CardTitle>
                {command.description && (
                    <CardDescription className="text-xs">
                        {command.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {command.params?.map(param => (
                    <div key={param.key} className="mb-2">
                        <label className="text-sm text-muted-foreground mb-1 block">
                            {param.name}
                        </label>
                        {renderParamInput(command, param)}
                    </div>
                ))}
                <Button 
                    onClick={() => triggerEvent(
                        command.key,
                        command.getData(getCommandParams(command))
                    )}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                >
                    触发
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-4 bg-background border rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">调试面板</h2>
            <Tabs defaultValue="all" onValueChange={setActiveCategory}>
                <TabsList className="w-full">
                    <TabsTrigger value="scene" className="flex-1">场景</TabsTrigger>
                    <TabsTrigger value="robot" className="flex-1">机器人</TabsTrigger>
                    <TabsTrigger value="audio" className="flex-1">音频</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[600px] pr-4">

                    <TabsContent value="scene" className="space-y-2 mt-2">
                        {EVENT_COMMANDS.scene.map(renderCommandButton)}
                    </TabsContent>

                    <TabsContent value="robot" className="space-y-2 mt-2">
                        {EVENT_COMMANDS.robot.map(renderCommandButton)}
                    </TabsContent>

                    <TabsContent value="audio" className="space-y-2 mt-2">
                        {EVENT_COMMANDS.audio.map(renderCommandButton)}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}

