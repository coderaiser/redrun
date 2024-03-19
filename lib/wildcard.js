export default (str) => {
    const wildcard = `^${str
        .replace('.', '\\.')
        .replace('*', '.*')
        .replace('?', '.?')}$`;
    
    return RegExp(wildcard);
};
