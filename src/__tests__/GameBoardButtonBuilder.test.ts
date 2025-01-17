import GameBoardButtonBuilder from '@bot/builder/GameBoardButtonBuilder';
import localize from '@i18n/localize';
import AI from '@tictactoe/ai/AI';
import { Player } from '@tictactoe/Player';
import { ActionRow, ButtonComponent } from 'discord.js';

jest.mock('@tictactoe/ai/AI');

describe('GameBoardButtonBuilder', () => {
    let builder: GameBoardButtonBuilder;

    beforeAll(() => {
        localize.loadFromLocale('en');
    });

    beforeEach(() => {
        builder = new GameBoardButtonBuilder();
    });

    it('should send empty message by default', () => {
        expect(builder.toMessageOptions()).toEqual({ content: '', components: [] });
    });

    it('should compute board components', () => {
        const options = builder
            .withBoard(2, [Player.First, Player.None, Player.None, Player.Second])
            .toMessageOptions();

        const components = <ActionRow<ButtonComponent>[]>options.components;

        expect(components).toHaveLength(2);
        expect(components[0].toJSON().components).toHaveLength(2);
        expect(components[1].toJSON().components).toHaveLength(2);
        expect(components[0].toJSON().components[0].label).toBe('X');
        expect(components[0].toJSON().components[1].label).toBe(' ');
        expect(components[1].toJSON().components[0].label).toBe(' ');
        expect(components[1].toJSON().components[1].label).toBe('O');
    });

    it('should compute board using two custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:')
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.First])
            .toMessageOptions();

        const components = <ActionRow<ButtonComponent>[]>options.components;

        expect(components[0].toJSON().components[0].emoji?.name).toBe('dog');
        expect(components[0].toJSON().components[1].emoji?.name).toBe('cat');
        expect(components[1].toJSON().components[0].emoji?.name).toBeUndefined();
        expect(components[1].toJSON().components[1].emoji?.name).toBe('dog');
    });

    it('should compute board using three custom emojies', () => {
        const options = builder
            .withEmojies(':dog:', ':cat:', ':square:')
            .withBoard(2, [Player.First, Player.None, Player.Second, Player.None])
            .toMessageOptions();

        const components = <ActionRow<ButtonComponent>[]>options.components;

        expect(components[0].toJSON().components[0].emoji?.name).toBe('dog');
        expect(components[0].toJSON().components[1].emoji?.name).toBe('square');
        expect(components[1].toJSON().components[0].emoji?.name).toBe('cat');
        expect(components[1].toJSON().components[1].emoji?.name).toBe('square');
    });

    it.each`
        entity                        | state
        ${undefined}                  | ${''}
        ${new AI()}                   | ${':robot: AI is playing, please wait...'}
        ${{ toString: () => 'fake' }} | ${'fake, select your move:'}
    `('should set state based if playing entity is $entity', ({ entity, state }) => {
        builder.withEntityPlaying(entity);
        expect(builder.toMessageOptions()).toEqual({ content: state, components: [] });
    });

    it('should compute board using disabled buttons after been used', () => {
        const options = builder
            .withButtonsDisabledAfterUse()
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.None])
            .toMessageOptions();

        const components = <ActionRow<ButtonComponent>[]>options.components;

        expect(components[0].toJSON().components[0].disabled).toBeTruthy();
        expect(components[0].toJSON().components[1].disabled).toBeTruthy();
        expect(components[1].toJSON().components[0].disabled).toBeFalsy();
        expect(components[1].toJSON().components[1].disabled).toBeFalsy();
    });

    it('should disable all buttons if game has ended', () => {
        const options = builder
            .withButtonsDisabledAfterUse()
            .withBoard(2, [Player.First, Player.Second, Player.None, Player.None])
            .withEndingMessage()
            .toMessageOptions();

        const components = <ActionRow<ButtonComponent>[]>options.components;

        expect(components[0].toJSON().components[0].disabled).toBeTruthy();
        expect(components[0].toJSON().components[1].disabled).toBeTruthy();
        expect(components[1].toJSON().components[0].disabled).toBeTruthy();
        expect(components[1].toJSON().components[1].disabled).toBeTruthy();
    });

    it('should use an embed if configured to use it', () => {
        const color = 16711680;
        const options = builder.withEmbed(color).toMessageOptions();
        expect(options.content).toBeUndefined();
        expect(options.embeds).toHaveLength(1);
        expect((options.embeds![0] as any).color).toBe(color);
    });
});
