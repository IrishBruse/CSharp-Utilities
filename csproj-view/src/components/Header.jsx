import { Component } from 'react';
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export class Header extends Component
{
    constructor(props)
    {
        super(props);
    }

    // render html
    render()
    {
        return (
            <div className='settings-editor'>
                <div className='settings-header'>
                    <VSCodeTextField />
                </div>
            </div>
        );
    }
}
