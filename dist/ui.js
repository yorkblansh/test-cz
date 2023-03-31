#!/usr/bin/env node
import React, { useState } from 'react';
import chalk from 'chalk';
import SelectInput from 'ink-select-input';
import { Text, useInput } from 'ink';
import shell from 'shelljs';
import figures from 'figures';
import { useBeforeRender } from './hooks/useBeforeRender.js';
import { useYamlConfig } from './hooks/useYamlConfig.js';
import { commandExecutor } from './utils/commandExecutor.js';
export const App = () => {
    useBeforeRender(() => {
        shell.exec('clear');
    }, []);
    const [isDone, setIsDone] = useState(false);
    const [percent, setPercent] = useState(0);
    const { yamlConfig, isError, isLoading } = useYamlConfig();
    const commandNames = yamlConfig
        ? Object.keys(yamlConfig.commandList)
        : undefined;
    const [isSelectInputFocused, setSelectInputFocus] = useState(true);
    useInput((input, key) => {
        if (isSelectInputFocused) {
            if (key.downArrow || key.upArrow) {
                setPercent(0);
            }
        }
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, null,
            chalk.hex('#ff0055').italic.bgWhiteBright(' cliper '),
            " \u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u0441\u043A\u0440\u0438\u043F\u0442\u043E\u0432"),
        React.createElement(Text, null, " "),
        React.createElement(Text, null,
            chalk.bgBlue(' INFO '),
            " \u0421\u0442\u0440\u0435\u043B\u043A\u0430\u043C\u0438 update tst \u0432\u0432\u0435\u0440\u0445 \u0438 \u0432\u043D\u0438\u0437 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u0437\u0430\u043F\u0443\u0441\u043A\u0430"),
        isLoading ? (React.createElement(Text, null,
            "\u0427\u0442\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u0444\u0438\u0433\u0430:",
            ' ',
            chalk.hex('#ff0055').italic.bgWhiteBright(' .anyshell.yaml '))) : isError ? (React.createElement(Text, null,
            "\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u043A\u043E\u043D\u0444\u0438\u0433-\u0444\u0430\u0439\u043B:",
            ' ',
            chalk.hex('#ff0055').italic.bgWhiteBright(' .anyshell.yaml '))) : (React.createElement(SelectInput, { isFocused: isSelectInputFocused ? true : false, onSelect: (item) => {
                setSelectInputFocus(false);
                commandExecutor(item.value, (cbProps) => {
                    cbProps.dockerComposeExitCode === 0
                        ? setSelectInputFocus(true)
                        : setSelectInputFocus(false);
                    if (cbProps.dockerComposeExitCode) {
                        setIsDone(cbProps.dockerComposeExitCode === 0 ? true : false);
                        console.log('HERE MUST BE INPUT FoCUS TRUEEE!!!!');
                        setSelectInputFocus(true);
                    }
                    if (cbProps.dockerComposePercent)
                        setPercent(cbProps.dockerComposePercent);
                });
            }, items: commandNames?.map((commandName) => ({
                label: commandName,
                key: commandName,
                value: yamlConfig?.commandList[commandName],
            })), indicatorComponent: ({ isSelected }) => isSelected ? (React.createElement(Text, { color: "#ffff86" },
                percent === 100 ? 'done' : null,
                " ",
                figures.pointer)) : null, itemComponent: ({ isSelected, label }) => isSelected ? (React.createElement(Text, { color: "#ff5eea" },
                ' ',
                label,
                " ",
                percent === 100 || percent === 0 ? null : percent)) : (React.createElement(Text, { color: "#aaeef3" },
                ' ' + ' ',
                label)), initialIndex: 2 })),
        React.createElement(SelectInput, { indicatorComponent: () => null, items: [{ label: '', value: '' }], isFocused: isSelectInputFocused ? false : true })));
};
