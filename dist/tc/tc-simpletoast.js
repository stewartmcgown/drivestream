/*
    by Stewart McGown @lordpankake 
      https://twistedcore.co.uk
*/
window.toasts = 0;

function toast(opts) {
    window.toasts += 1;
    $("body").append(
        `<div class="tc-toast" id="toast-${toasts}"></div>`
    );

    let toast = $(`#toast-${toasts}`);

    /* apply options */
    toast.html(opts.content);

    if (opts.icon)
        toast.prepend(`<i class='fa fa-${opts.icon}'></i>`);
    if (opts.link)
        toast.append("<a href='#' data-dismiss='toast' class='toast-link'>Done</a>")

    toast.addClass("toast-opening");

    toast.css('bottom', '20px');

    if (!opts.indeterminate) {
        setTimeout(function () {
            window.toasts -= 1;
            toast.removeClass("toast-opening").addClass("toast-closing");
            setTimeout(function () {
                toast.remove();
            }, 1000);

        }, 3000);
    }
}

