###-begin-redrun-completion-###
#
# redrun npm-scripts completion script
#
# Installation: redrun-completion >> ~/.bashrc  (or ~/.zshrc)
# Or, maybe: redrun-completion > /usr/local/etc/bash_completion.d/npm
#

if type complete &>/dev/null; then
  _redrun_completion () {
    local words cword
    if type _get_comp_words_by_ref &>/dev/null; then
      _get_comp_words_by_ref -n = -n @ -w words -i cword
    else
      cword="$COMP_CWORD"
      words=("${COMP_WORDS[@]}")
    fi

    local si="$IFS"
    cword=2
    
    words[2]=${words[1]}
    words[1]='run'
    
    IFS=$'\n' COMPREPLY=($(COMP_CWORD="$cword" \
                           COMP_LINE="$COMP_LINE" \
                           COMP_POINT="$COMP_POINT" \
                           npm completion -- "${words[@]}" \
                           2>/dev/null)) || return $?
    IFS="$si"
  }
  complete -o default -F _redrun_completion redrun
elif type compdef &>/dev/null; then
  _redrun_completion() {
    words[3]=${words[2]}
    words[2]='run'
    
    local si=$IFS
    compadd -- $(COMP_CWORD=$((CURRENT)) \
                 COMP_LINE=$BUFFER \
                 COMP_POINT=0 \
                 npm completion -- "${words[@]}" \
                 2>/dev/null)
    IFS=$si
  }
  compdef _redrun_completion redrun
elif type compctl &>/dev/null; then
  _redrun_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    read -l line
    read -ln point
    si="$IFS"
     
    words[3]=${words[2]}
    words[2]='run'
    
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       npm completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K _redrun_completion redrun
fi
###-end-redrun-completion-###
