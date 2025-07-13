import { App, PluginSettingTab, Setting } from "obsidian";
import CrossOSNameGuard from "./main";
import { DEFAULT_FORBIDDEN_CHARS } from "./constants";

export interface CrossOSNameGuardSettings {
	extraForbidden: string;
}

export const DEFAULT_SETTINGS: CrossOSNameGuardSettings = {
	extraForbidden: "",
};

export class CrossOSNameGuardSettingTab extends PluginSettingTab {
	plugin: CrossOSNameGuard;

	constructor(app: App, plugin: CrossOSNameGuard) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Cross-OS Name Guard Settings" });

		new Setting(containerEl)
			.setName("Additional Forbidden Characters")
			.setDesc("Add any extra characters to forbid (e.g., $ & @). These will be added to the default list : " + DEFAULT_FORBIDDEN_CHARS)
			.addText(text => 
				text
					.setPlaceholder("e.g., $&@")
					.setValue(this.plugin.settings.extraForbidden)
					.onChange(async (value) => {
						this.plugin.settings.extraForbidden = value;
						await this.plugin.saveSettings();
						console.debug(`⚙️ Updated extra forbidden characters: ${value}`);
					}));
	}
}
